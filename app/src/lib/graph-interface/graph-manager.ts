import { get, writable, type Writable } from "svelte/store";
import type { Graph, Node, Edge, Socket, NodeRegistry, } from "@nodes/types";
import { HistoryManager } from "./history-manager.js"
import EventEmitter from "./helpers/EventEmitter.js";
import throttle from "./helpers/throttle.js";
import { createLogger } from "./helpers/index.js";
import type { NodeInput } from "@nodes/types";

const logger = createLogger("graph-manager");

function areSocketsCompatible(output: string | undefined, inputs: string | string[] | undefined) {
  if (Array.isArray(inputs) && output) {
    return inputs.includes(output);
  }
  return inputs === output;
}

export class GraphManager extends EventEmitter<{ "save": Graph, "result": any }> {

  status: Writable<"loading" | "idle" | "error"> = writable("loading");
  loaded = false;

  graph: Graph = { id: 0, nodes: [], edges: [] };
  id = writable(0);

  private _nodes: Map<number, Node> = new Map();
  nodes: Writable<Map<number, Node>> = writable(new Map());
  settingTypes: NodeInput[] = [];
  settings: Writable<Record<string, any>> = writable({});
  private _edges: Edge[] = [];
  edges: Writable<Edge[]> = writable([]);

  currentUndoGroup: number | null = null;

  inputSockets: Writable<Set<string>> = writable(new Set());

  history: HistoryManager = new HistoryManager();

  constructor(private nodeRegistry: NodeRegistry) {
    super();
    this.nodes.subscribe((nodes) => {
      this._nodes = nodes;
    });
    this.edges.subscribe((edges) => {
      this._edges = edges;
      const s = new Set<string>();
      for (const edge of edges) {
        s.add(`${edge[2].id}-${edge[3]}`);
      }
      this.inputSockets.set(s);
    });
    this.execute = throttle(() => this._execute(), 50);
  }

  serialize(): Graph {
    logger.group("serializing graph")
    const nodes = Array.from(this._nodes.values()).map(node => ({
      id: node.id,
      position: [...node.position],
      type: node.type,
      props: node.props,
    })) as Node[];
    const edges = this._edges.map(edge => [edge[0].id, edge[1], edge[2].id, edge[3]]) as Graph["edges"];
    const settings = get(this.settings);
    const serialized = { id: this.graph.id, settings, nodes, edges };
    console.log(serialized);
    logger.groupEnd();

    return serialized;
  }

  execute() { }
  _execute() {
    if (this.loaded === false) return;
    this.emit("result", this.serialize());
  }

  getNodeTypes() {
    return this.nodeRegistry.getAllNodes();
  }

  getLinkedNodes(node: Node) {
    const nodes = new Set<Node>();
    const stack = [node];
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      nodes.add(n);
      const children = this.getChildrenOfNode(n);
      const parents = this.getParentsOfNode(n);
      const newNodes = [...children, ...parents].filter(n => !nodes.has(n));
      stack.push(...newNodes);
    }
    return [...nodes.values()];
  }


  getEdgesBetweenNodes(nodes: Node[]): [number, number, number, string][] {

    const edges = [];
    for (const node of nodes) {
      const children = node.tmp?.children || [];
      for (const child of children) {
        if (nodes.includes(child)) {
          const edge = this._edges.find(e => e[0].id === node.id && e[2].id === child.id);
          if (edge) {
            edges.push([edge[0].id, edge[1], edge[2].id, edge[3]] as [number, number, number, string]);
          }
        }
      }
    }

    return edges;
  }


  private _init(graph: Graph) {
    const nodes = new Map(graph.nodes.map(node => {
      const nodeType = this.nodeRegistry.getNode(node.type);
      if (nodeType) {
        node.tmp = {
          type: nodeType
        };
      }
      return [node.id, node]
    }));

    const edges = graph.edges.map((edge) => {
      const from = nodes.get(edge[0]);
      const to = nodes.get(edge[2]);
      if (!from || !to) {
        throw new Error("Edge references non-existing node");
      };
      from.tmp = from.tmp || {};
      from.tmp.children = from.tmp.children || [];
      from.tmp.children.push(to);
      to.tmp = to.tmp || {};
      to.tmp.parents = to.tmp.parents || [];
      to.tmp.parents.push(from);
      return [from, edge[1], to, edge[3]] as Edge;
    })

    this.edges.set(edges);
    this.nodes.set(nodes);

    this.execute();

  }

  async load(graph: Graph) {

    const a = performance.now();

    this.loaded = false;
    this.graph = graph;
    this.status.set("loading");
    this.id.set(graph.id);

    if (graph.settings) {
      this.settings.set(graph.settings);
    } else {
      this.settings.set({});
    }

    const nodeIds = Array.from(new Set([...graph.nodes.map(n => n.type)]));
    await this.nodeRegistry.load(nodeIds);

    for (const node of this.graph.nodes) {
      const nodeType = this.nodeRegistry.getNode(node.type);
      if (!nodeType) {
        logger.error(`Node type not found: ${node.type}`);
        this.status.set("error");
        return;
      }
      node.tmp = node.tmp || {};
      node.tmp.type = nodeType;
    }

    let settings: Record<string, NodeInput> = {};
    const types = this.getNodeTypes();
    for (const type of types) {
      if (type.inputs) {
        for (const key in type.inputs) {
          let settingId = type.inputs[key].setting;
          if (settingId) {
            settings[settingId] = type.inputs[key];
          }
        }
      }
    }

    this.history.reset();
    this._init(this.graph);

    this.save();

    this.status.set("idle");

    this.loaded = true;
    logger.log(`Graph loaded in ${performance.now() - a}ms`);
    setTimeout(() => this.execute(), 100);
  }


  getAllNodes() {
    return Array.from(this._nodes.values());
  }

  getNode(id: number) {
    return this._nodes.get(id);
  }

  getNodeType(id: string) {
    return this.nodeRegistry.getNode(id);
  }

  getChildrenOfNode(node: Node) {
    const children = [];
    const stack = node.tmp?.children?.slice(0);
    while (stack?.length) {
      const child = stack.pop();
      if (!child) continue;
      children.push(child);
      stack.push(...child.tmp?.children || []);
    }
    return children;
  }

  getNodesBetween(from: Node, to: Node): Node[] | undefined {
    //  < - - - - from
    const toParents = this.getParentsOfNode(to);
    //  < - - - - from - - - - to
    const fromParents = this.getParentsOfNode(from);
    if (toParents.includes(from)) {
      const fromChildren = this.getChildrenOfNode(from);
      return toParents.filter(n => fromChildren.includes(n));
    } else if (fromParents.includes(to)) {
      const toChildren = this.getChildrenOfNode(to);
      return fromParents.filter(n => toChildren.includes(n));
    } else {
      // these two nodes are not connected
      return;
    }
  }

  removeNode(node: Node, { restoreEdges = false } = {}) {

    const edgesToNode = this._edges.filter((edge) => edge[2].id === node.id);
    const edgesFromNode = this._edges.filter((edge) => edge[0].id === node.id);
    for (const edge of [...edgesToNode, ...edgesFromNode]) {
      this.removeEdge(edge, { applyDeletion: false });
    }

    if (restoreEdges) {
      const outputSockets = edgesToNode.map(e => [e[0], e[1]] as const);
      const inputSockets = edgesFromNode.map(e => [e[2], e[3]] as const);

      for (const [to, toSocket] of inputSockets) {
        for (const [from, fromSocket] of outputSockets) {
          const outputType = from.tmp?.type?.outputs?.[fromSocket];
          const inputType = to?.tmp?.type?.inputs?.[toSocket]?.type;
          if (outputType === inputType) {
            this.createEdge(from, fromSocket, to, toSocket, { applyUpdate: false });
            continue;
          }
        }
      }
    }

    this.edges.set(this._edges);

    this.nodes.update((nodes) => {
      nodes.delete(node.id);
      return nodes;
    });
    this.execute()
    this.save();
  }

  createNodeId() {
    const max = Math.max(...this._nodes.keys());
    return max + 1;
  }

  createGraph(nodes: Node[], edges: [number, number, number, string][]) {

    // map old ids to new ids
    const idMap = new Map<number, number>();

    const startId = this.createNodeId();

    nodes = nodes.map((node, i) => {
      const id = startId + i;
      idMap.set(node.id, id);
      const type = this.nodeRegistry.getNode(node.type);
      if (!type) {
        throw new Error(`Node type not found: ${node.type}`);
      }
      return { ...node, id, tmp: { type } };
    });

    const _edges = edges.map(edge => {
      const from = nodes.find(n => n.id === idMap.get(edge[0]));
      const to = nodes.find(n => n.id === idMap.get(edge[2]));

      if (!from || !to) {
        throw new Error("Edge references non-existing node");
      }

      to.tmp = to.tmp || {};
      to.tmp.parents = to.tmp.parents || [];
      to.tmp.parents.push(from);

      from.tmp = from.tmp || {};
      from.tmp.children = from.tmp.children || [];
      from.tmp.children.push(to);

      return [from, edge[1], to, edge[3]] as Edge;
    });

    for (const node of nodes) {
      this._nodes.set(node.id, node);
    }

    this._edges.push(..._edges);

    this.nodes.set(this._nodes);
    this.edges.set(this._edges);
    this.save();
    return nodes;
  }

  createNode({ type, position, props = {} }: { type: Node["type"], position: Node["position"], props: Node["props"] }) {

    const nodeType = this.nodeRegistry.getNode(type);
    if (!nodeType) {
      logger.error(`Node type not found: ${type}`);
      return;
    }

    const node: Node = { id: this.createNodeId(), type, position, tmp: { type: nodeType }, props };

    this.nodes.update((nodes) => {
      nodes.set(node.id, node);
      return nodes;
    });

    this.save();
  }

  createEdge(from: Node, fromSocket: number, to: Node, toSocket: string, { applyUpdate = true } = {}) {

    const existingEdges = this.getEdgesToNode(to);

    // check if this exact edge already exists
    const existingEdge = existingEdges.find(e => e[0].id === from.id && e[1] === fromSocket && e[3] === toSocket);
    if (existingEdge) {
      logger.error("Edge already exists", existingEdge);
      return;
    };

    // check if socket types match
    const fromSocketType = from.tmp?.type?.outputs?.[fromSocket];
    const toSocketType = to.tmp?.type?.inputs?.[toSocket]?.type;

    if (!areSocketsCompatible(fromSocketType, toSocketType)) {
      logger.error(`Socket types do not match: ${fromSocketType} !== ${toSocketType}`);
      return;
    }

    const edgeToBeReplaced = this._edges.find(e => e[2].id === to.id && e[3] === toSocket);
    if (edgeToBeReplaced) {
      this.removeEdge(edgeToBeReplaced, { applyDeletion: false });
    }

    if (applyUpdate) {
      this._edges.push([from, fromSocket, to, toSocket]);
    } else {
      this._edges.push([from, fromSocket, to, toSocket]);
    }

    from.tmp = from.tmp || {};
    from.tmp.children = from.tmp.children || [];
    from.tmp.children.push(to);

    to.tmp = to.tmp || {};
    to.tmp.parents = to.tmp.parents || [];
    to.tmp.parents.push(from);

    if (applyUpdate) {
      this.edges.set(this._edges);
      this.save();
    }
    this.execute();
  }

  undo() {
    const nextState = this.history.undo();
    if (nextState) {
      this._init(nextState);
      this.emit("save", this.serialize());
    }
  }


  redo() {
    const nextState = this.history.redo();
    if (nextState) {
      this._init(nextState);
      this.emit("save", this.serialize());
    }

  }

  startUndoGroup() {
    this.currentUndoGroup = 1;
  }

  saveUndoGroup() {
    this.currentUndoGroup = null;
    this.save();
  }

  save() {
    if (this.currentUndoGroup) return;
    const state = this.serialize();
    this.history.save(state);
    this.emit("save", state);
    logger.log("saving graphs", state);
  }

  getParentsOfNode(node: Node) {
    const parents = [];
    const stack = node.tmp?.parents?.slice(0);
    while (stack?.length) {
      if (parents.length > 1000000) {
        logger.warn("Infinite loop detected")
        break;
      }
      const parent = stack.pop();
      if (!parent) continue;
      parents.push(parent);
      stack.push(...parent.tmp?.parents || []);
    }
    return parents.reverse();
  }

  getPossibleSockets({ node, index }: Socket): [Node, string | number][] {

    const nodeType = node?.tmp?.type;
    if (!nodeType) return [];

    const sockets: [Node, string | number][] = []

    // if index is a string, we are an input looking for outputs
    if (typeof index === "string") {

      // filter out self and child nodes
      const children = new Set(this.getChildrenOfNode(node).map(n => n.id));
      const nodes = this.getAllNodes().filter(n => n.id !== node.id && !children.has(n.id));

      const ownType = nodeType?.inputs?.[index].type;

      for (const node of nodes) {
        const nodeType = node?.tmp?.type;
        const inputs = nodeType?.outputs;
        if (!inputs) continue;
        for (let index = 0; index < inputs.length; index++) {
          if (inputs[index] === ownType) {
            sockets.push([node, index]);
          }
        }
      }

    } else if (typeof index === "number") {
      // if index is a number, we are an output looking for inputs

      // filter out self and parent nodes
      const parents = new Set(this.getParentsOfNode(node).map(n => n.id));
      const nodes = this.getAllNodes().filter(n => n.id !== node.id && !parents.has(n.id));

      // get edges from this socket
      const edges = new Map(this.getEdgesFromNode(node).filter(e => e[1] === index).map(e => [e[2].id, e[3]]));

      const ownType = nodeType.outputs?.[index];

      for (const node of nodes) {
        const inputs = node?.tmp?.type?.inputs;
        if (!inputs) continue;
        for (const key in inputs) {
          if (areSocketsCompatible(ownType, inputs[key].type) && edges.get(node.id) !== key) {
            sockets.push([node, key]);
          }
        }
      }
    }

    return sockets;

  }

  removeEdge(edge: Edge, { applyDeletion = true }: { applyDeletion?: boolean } = {}) {
    const id0 = edge[0].id;
    const sid0 = edge[1];
    const id2 = edge[2].id;
    const sid2 = edge[3];

    const _edge = this._edges.find((e) => e[0].id === id0 && e[1] === sid0 && e[2].id === id2 && e[3] === sid2);
    if (!_edge) return;

    edge[0].tmp = edge[0].tmp || {};
    if (edge[0].tmp.children) {
      edge[0].tmp.children = edge[0].tmp.children.filter(n => n.id !== id2);
    }

    edge[2].tmp = edge[2].tmp || {};
    if (edge[2].tmp.parents) {
      edge[2].tmp.parents = edge[2].tmp.parents.filter(n => n.id !== id0);
    }

    if (applyDeletion) {
      this.edges.update((edges) => {
        return edges.filter(e => e !== _edge);
      });
      this.execute();
      this.save();
    } else {
      this._edges = this._edges.filter(e => e !== _edge);
    }

  }

  getEdgesToNode(node: Node) {
    return this._edges
      .filter((edge) => edge[2].id === node.id)
      .map((edge) => {
        const from = this.getNode(edge[0].id);
        const to = this.getNode(edge[2].id);
        if (!from || !to) return;
        return [from, edge[1], to, edge[3]] as const;
      })
      .filter(Boolean) as unknown as [Node, number, Node, string][];
  }

  getEdgesFromNode(node: Node) {
    return this._edges
      .filter((edge) => edge[0].id === node.id)
      .map((edge) => {
        const from = this.getNode(edge[0].id);
        const to = this.getNode(edge[2].id);
        if (!from || !to) return;
        return [from, edge[1], to, edge[3]] as const;
      })
      .filter(Boolean) as unknown as [Node, number, Node, string][];
  }


}

