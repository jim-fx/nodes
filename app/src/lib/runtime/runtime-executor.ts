import { RemoteNodeRegistry } from '@nodarium/registry';
import type {
  Graph,
  NodeDefinition,
  NodeInput,
  NodeRegistry,
  RuntimeExecutor,
  SyncCache
} from '@nodarium/types';
import {
  createLogger,
  createWasmWrapper,
  encodeFloat,
  type PerformanceStore
} from '@nodarium/utils';
import type { RuntimeNode } from './types';

const log = createLogger('runtime-executor');
// log.mute(); // Keep logging enabled for debug info

const remoteRegistry = new RemoteNodeRegistry('');

type WasmExecute = (outputPos: number, args: number[]) => number;

function getValue(input: NodeInput, value?: unknown): number | number[] | Int32Array {
  if (value === undefined && 'value' in input) {
    value = input.value;
  }

  switch (input.type) {
    case 'float':
      return encodeFloat(value as number);

    case 'select':
      return (value as number) ?? 0;

    case 'vec3': {
      const arr = Array.isArray(value) ? value : [];
      return [0, arr.length + 1, ...arr.map(v => encodeFloat(v)), 1, 1];
    }
  }

  if (Array.isArray(value)) {
    return [0, value.length + 1, ...value, 1, 1];
  }

  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value;
  if (value instanceof Int32Array) return value;

  throw new Error(`Unsupported input type: ${input.type}`);
}

function compareInt32(a: Int32Array, b: Int32Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export type Pointer = {
  start: number;
  end: number;
  _title?: string;
};

export class MemoryRuntimeExecutor implements RuntimeExecutor {
  private nodes = new Map<string, { definition: NodeDefinition; execute: WasmExecute }>();

  private offset = 0;
  private isRunning = false;

  private readonly memory = new WebAssembly.Memory({
    initial: 4096,
    maximum: 8192
  });

  private memoryView!: Int32Array;

  results: Record<number, Pointer> = {};
  inputPtrs: Record<number, Pointer[]> = {};
  allPtrs: Pointer[] = [];

  seed = 42424242;
  perf?: PerformanceStore;

  constructor(
    private readonly registry: NodeRegistry,
    public cache?: SyncCache<Int32Array>
  ) {
    this.cache = undefined;
    this.refreshView();
    log.info('MemoryRuntimeExecutor initialized');
  }

  private refreshView(): void {
    this.memoryView = new Int32Array(this.memory.buffer);
    log.info(`Memory view refreshed, length: ${this.memoryView.length}`);
  }

  public getMemory(): Int32Array {
    return new Int32Array(this.memory.buffer);
  }

  private map = new Map<string, { definition: NodeDefinition; execute: WasmExecute }>();
  private async getNodeDefinitions(graph: Graph) {
    if (this.registry.status !== 'ready') {
      throw new Error('Node registry is not ready');
    }

    await this.registry.load(graph.nodes.map(n => n.type));
    log.info(`Loaded ${graph.nodes.length} node types from registry`);

    for (const { type } of graph.nodes) {
      if (this.map.has(type)) continue;

      const def = this.registry.getNode(type);
      if (!def) continue;

      log.info(`Fetching WASM for node type: ${type}`);
      const buffer = await remoteRegistry.fetchArrayBuffer(`nodes/${type}.wasm`);
      const wrapper = createWasmWrapper(buffer, this.memory);

      this.map.set(type, {
        definition: def,
        execute: wrapper.execute
      });
      log.info(`Node type ${type} loaded and wrapped`);
    }

    return this.map;
  }

  private async addMetaData(graph: Graph) {
    this.nodes = await this.getNodeDefinitions(graph);
    log.info(`Metadata added for ${this.nodes.size} nodes`);

    const graphNodes = graph.nodes.map(node => {
      const n = node as RuntimeNode;
      n.state = {
        depth: 0,
        children: [],
        parents: [],
        inputNodes: {}
      };
      return n;
    });

    const outputNode = graphNodes.find(n => n.type.endsWith('/output') || n.type.endsWith('/debug'))
      ?? graphNodes[0];

    const nodeMap = new Map(graphNodes.map(n => [n.id, n]));

    for (const [parentId, , childId, childInput] of graph.edges) {
      const parent = nodeMap.get(parentId);
      const child = nodeMap.get(childId);
      if (!parent || !child) continue;

      parent.state.children.push(child);
      child.state.parents.push(parent);
      child.state.inputNodes[childInput] = parent;
    }

    const ordered: RuntimeNode[] = [];
    const stack = [outputNode];

    while (stack.length) {
      const node = stack.pop()!;
      for (const parent of node.state.parents) {
        parent.state.depth = node.state.depth + 1;
        stack.push(parent);
      }
      ordered.push(node);
    }

    log.info(`Output node: ${outputNode.id}, total nodes ordered: ${ordered.length}`);
    return [outputNode, ordered] as const;
  }

  private writeToMemory(value: number | number[] | Int32Array, title?: string): Pointer {
    const start = this.offset;

    if (typeof value === 'number') {
      this.memoryView[this.offset++] = value;
    } else {
      this.memoryView.set(value, this.offset);
      this.offset += value.length;
    }

    const ptr = { start, end: this.offset, _title: title };
    this.allPtrs.push(ptr);
    log.info(`Memory written for ${title}: start=${ptr.start}, end=${ptr.end}`);
    return ptr;
  }

  async execute(graph: Graph, settings: Record<string, unknown>): Promise<Int32Array> {
    if (this.isRunning) {
      log.info('Executor is already running, skipping execution');
      return undefined as unknown as Int32Array;
    }

    this.isRunning = true;
    log.info('Execution started');

    try {
      this.offset = 0;
      this.results = {};
      this.inputPtrs = {};
      this.allPtrs = [];
      this.seed += 2;

      this.refreshView();

      const [outputNode, nodes] = await this.addMetaData(graph);

      const sortedNodes = [...nodes].sort(
        (a, b) => (b.state.depth ?? 0) - (a.state.depth ?? 0)
      );

      const seedPtr = this.writeToMemory(this.seed, 'seed');

      const settingPtrs = new Map<string, Pointer>();
      for (const [key, value] of Object.entries(settings)) {
        const ptr = this.writeToMemory(value as number, `setting.${key}`);
        settingPtrs.set(key, ptr);
      }

      let lastNodePtr: Pointer | undefined = undefined;

      for (const node of sortedNodes) {
        const nodeType = this.nodes.get(node.type);
        if (!nodeType) continue;

        log.info(`Executing node: ${node.id} (type: ${node.type})`);

        const inputs = Object.entries(nodeType.definition.inputs || {}).map(
          ([key, input]) => {
            if (input.type === 'seed') return seedPtr;

            if (input.setting) {
              const ptr = settingPtrs.get(input.setting);
              if (!ptr) throw new Error(`Missing setting: ${input.setting}`);
              return ptr;
            }

            const src = node.state.inputNodes[key];
            if (src) {
              const res = this.results[src.id];
              if (!res) {
                throw new Error(`Missing input from ${src.type}/${src.id}`);
              }
              return res;
            }

            if (node.props?.[key] !== undefined) {
              return this.writeToMemory(
                getValue(input, node.props[key]),
                `${node.id}.${key}`
              );
            }

            return this.writeToMemory(getValue(input), `${node.id}.${key}`);
          }
        );

        this.inputPtrs[node.id] = inputs;
        const args = inputs.flatMap(p => [p.start * 4, p.end * 4]);

        log.info(`Executing node ${node.type}/${node.id}`);
        const bytesWritten = nodeType.execute(this.offset * 4, args);
        if (bytesWritten === -1) {
          throw new Error(`Failed to execute node`);
        }
        this.refreshView();

        const outLen = bytesWritten >> 2;
        const outputStart = this.offset;

        if (
          args.length === 2
          && inputs[0].end - inputs[0].start === outLen
          && compareInt32(
            this.memoryView.slice(inputs[0].start, inputs[0].end),
            this.memoryView.slice(outputStart, outputStart + outLen)
          )
        ) {
          this.results[node.id] = inputs[0];
          log.info(`Node ${node.id} result reused input memory`);
        } else {
          this.results[node.id] = {
            start: outputStart,
            end: outputStart + outLen,
            _title: `${node.id} ->`
          };
          this.offset += outLen;
          lastNodePtr = this.results[node.id];
          log.info(
            `Node ${node.id} wrote result to memory: start=${outputStart}, end=${outputStart + outLen
            }`
          );
        }
      }

      const res = this.results[outputNode.id] ?? lastNodePtr;
      if (!res) throw new Error('Output node produced no result');

      log.info(`Execution finished, output pointer: start=${res.start}, end=${res.end}`);
      this.refreshView();
      return this.memoryView.slice(res.start, res.end);
    } catch (e) {
      log.info('Execution error:', e);
      console.error(e);
    } finally {
      this.isRunning = false;
      this.perf?.endPoint('runtime');
      log.info('Executor state reset');
    }
  }

  getPerformanceData() {
    return this.perf?.get();
  }
}
