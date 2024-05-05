import type { Graph, NodeRegistry, NodeDefinition, RuntimeExecutor, NodeInput } from "@nodes/types";
import { concatEncodedArrays, encodeFloat, fastHashArrayBuffer, createLogger, type PerformanceStore } from "@nodes/utils"
import type { SyncCache } from "@nodes/types";

const log = createLogger("runtime-executor");
log.mute()

function getValue(input: NodeInput, value?: unknown) {
  if (value === undefined && "value" in input) {
    value = input.value
  }
  if (input.type === "float") {
    return encodeFloat(value as number);
  }

  if (Array.isArray(value)) {
    if (input.type === "vec3") {
      return [0, value.length + 1, ...value.map(v => encodeFloat(v)), 1, 1] as number[];
    }
    return [0, value.length + 1, ...value, 1, 1] as number[];
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (value instanceof Int32Array) {
    return value;
  }

  throw new Error(`Unknown input type ${input.type}`);
}

export class MemoryRuntimeExecutor implements RuntimeExecutor {

  private definitionMap: Map<string, NodeDefinition> = new Map();

  private randomSeed = Math.floor(Math.random() * 100000000);

  perf?: PerformanceStore;

  constructor(private registry: NodeRegistry, private cache?: SyncCache<Int32Array>) { }

  private async getNodeDefinitions(graph: Graph) {

    if (this.registry.status !== "ready") {
      throw new Error("Node registry is not ready");
    }

    await this.registry.load(graph.nodes.map(node => node.type));

    const typeMap = new Map<string, NodeDefinition>();
    for (const node of graph.nodes) {
      if (!typeMap.has(node.type)) {
        const type = this.registry.getNode(node.type);
        if (type) {
          typeMap.set(node.type, type);
        }
      }
    }
    return typeMap;
  }

  private async addMetaData(graph: Graph) {

    // First, lets check if all nodes have a definition
    this.definitionMap = await this.getNodeDefinitions(graph);

    const outputNode = graph.nodes.find(node => node.type.endsWith("/output"));
    if (!outputNode) {
      throw new Error("No output node found");
    }
    outputNode.tmp = outputNode.tmp || {};
    outputNode.tmp.depth = 0;

    const nodeMap = new Map(graph.nodes.map(node => [node.id, node]));

    // loop through all edges and assign the parent and child nodes to each node
    for (const edge of graph.edges) {
      const [parentId, _parentOutput, childId, childInput] = edge;
      const parent = nodeMap.get(parentId);
      const child = nodeMap.get(childId);
      if (parent && child) {
        parent.tmp = parent.tmp || {};
        parent.tmp.children = parent.tmp.children || [];
        parent.tmp.children.push(child);
        child.tmp = child.tmp || {};
        child.tmp.parents = child.tmp.parents || [];
        child.tmp.parents.push(parent);
        child.tmp.inputNodes = child.tmp.inputNodes || {};
        child.tmp.inputNodes[childInput] = parent;
      }
    }

    const nodes = []

    // loop through all the nodes and assign each nodes its depth
    const stack = [outputNode];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      node.tmp = node.tmp || {};
      if (node?.tmp?.depth === undefined) {
        node.tmp.depth = 0;
      }
      if (node?.tmp?.parents !== undefined) {
        for (const parent of node.tmp.parents) {
          parent.tmp = parent.tmp || {};
          if (parent.tmp?.depth === undefined) {
            parent.tmp.depth = node.tmp.depth + 1;
            stack.push(parent);
          } else {
            parent.tmp.depth = Math.max(parent.tmp.depth, node.tmp.depth + 1);
          }
        }
      }
      nodes.push(node);
    }

    return [outputNode, nodes] as const;
  }

  async execute(graph: Graph, settings: Record<string, unknown>) {

    this.perf?.addPoint("runtime");

    let a = performance.now();

    // Then we add some metadata to the graph
    const [outputNode, nodes] = await this.addMetaData(graph);
    let b = performance.now();

    this.perf?.addPoint("collect-metadata", b - a);

    /*
    * Here we sort the nodes into buckets, which we then execute one by one
    * +-b2-+-b1-+---b0---+
    * |    |    |        |
    * | n3 | n2 | Output |
    * | n6 | n4 | Level  |
    * |    | n5 |        |
    * |    |    |        |
    * +----+----+--------+
    */

    // we execute the nodes from the bottom up
    const sortedNodes = nodes.sort((a, b) => (b.tmp?.depth || 0) - (a.tmp?.depth || 0));

    // here we store the intermediate results of the nodes
    const results: Record<string, Int32Array> = {};

    for (const node of sortedNodes) {

      const node_type = this.definitionMap.get(node.type)!;

      if (!node_type || !node.tmp || !node_type.execute) {
        log.warn(`Node ${node.id} has no definition`);
        continue;
      };

      a = performance.now();

      // Collect the inputs for the node
      const inputs = Object.entries(node_type.inputs || {}).map(([key, input]) => {

        if (input.type === "seed") {
          if (settings["randomSeed"] === true) {
            return Math.floor(Math.random() * 100000000)
          } else {
            return this.randomSeed
          }
        }

        // If the input is linked to a setting, we use that value
        if (input.setting) {
          return getValue(input, settings[input.setting]);
        }

        // check if the input is connected to another node
        const inputNode = node.tmp?.inputNodes?.[key];
        if (inputNode) {
          if (results[inputNode.id] === undefined) {
            throw new Error(`Node ${node.type} is missing input from node ${inputNode.type}`);
          }
          return results[inputNode.id];
        }

        // If the value is stored in the node itself, we use that value
        if (node.props?.[key] !== undefined) {
          return getValue(input, node.props[key]);
        }

        return getValue(input);
      });
      b = performance.now();

      this.perf?.addPoint("collected-inputs", b - a);

      try {

        a = performance.now();
        const encoded_inputs = concatEncodedArrays(inputs);
        b = performance.now();
        this.perf?.addPoint("encoded-inputs", b - a);

        a = performance.now();
        let inputHash = `node-${node.id}-${fastHashArrayBuffer(encoded_inputs)}`;
        b = performance.now();
        this.perf?.addPoint("hash-inputs", b - a);

        let cachedValue = this.cache?.get(inputHash);
        if (cachedValue !== undefined) {
          log.log(`Using cached value for ${node_type.id || node.id}`);
          this.perf?.addPoint("cache-hit", 1);
          results[node.id] = cachedValue as Int32Array;
          continue;
        }
        this.perf?.addPoint("cache-hit", 0);

        log.group(`executing ${node_type.id || node.id}`);
        log.log(`Inputs:`, inputs);
        a = performance.now();
        results[node.id] = node_type.execute(encoded_inputs);
        b = performance.now();

        if (this.cache) {
          this.cache.set(inputHash, results[node.id]);
        }

        this.perf?.addPoint("node/" + node_type.id, b - a);
        log.log("Result:", results[node.id]);
        log.groupEnd();

      } catch (e) {
        log.groupEnd();
        log.error(`Error executing node ${node_type.id || node.id}`, e);
      }


    }

    // return the result of the parent of the output node
    const res = results[outputNode.id];

    if (this.cache) {
      this.cache.size = sortedNodes.length * 2;
    }

    this.perf?.endPoint("runtime");

    return res as unknown as Int32Array;

  }

  getPerformanceData() {
    return this.perf?.get();
  }

}
