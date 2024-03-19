import { writable, type Writable } from "svelte/store";
import { type Graph, type Node, type Edge, type Socket, type NodeRegistry, type RuntimeExecutor } from "./types";
import { HistoryManager } from "./history-manager";
import * as templates from "./graphs";
import EventEmitter from "./helpers/EventEmitter";

export class GraphManager extends EventEmitter<{ "save": Graph }> {

  status: Writable<"loading" | "idle" | "error"> = writable("loading");

  graph: Graph = { nodes: [], edges: [] };

  private _nodes: Map<number, Node> = new Map();
  nodes: Writable<Map<number, Node>> = writable(new Map());
  private _edges: Edge[] = [];
  edges: Writable<Edge[]> = writable([]);

  inputSockets: Writable<Set<string>> = writable(new Set());

  history: HistoryManager = new HistoryManager(this);

  constructor(private nodeRegistry: NodeRegistry, private runtime: RuntimeExecutor) {
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
  }

  serialize(): Graph {
    const nodes = Array.from(this._nodes.values()).map(node => ({
      id: node.id,
      position: { x: node.position.x, y: node.position.y },
      type: node.type,
      props: node.props,
    }));
    const edges = this._edges.map(edge => [edge[0].id, edge[1], edge[2].id, edge[3]]) as Graph["edges"];
    return { nodes, edges };
  }

  execute() {
    if (!this.runtime["loaded"]) return;
    const start = performance.now();
    const result = this.runtime.execute(this.serialize());
    const end = performance.now();
    console.log(`Execution took ${end - start}ms -> ${result}`);
  }


  private _init(graph: Graph) {
    const nodes = new Map(graph.nodes.map(node => {
      const nodeType = this.nodeRegistry.getNode(node.type);
      if (nodeType) {
        node.tmp = node.tmp || {};
        node.tmp.type = nodeType;
      }
      return [node.id, node]
    }));

    this.edges.set(graph.edges.map((edge) => {
      const from = nodes.get(edge[0]);
      const to = nodes.get(edge[2]);
      if (!from || !to) {
        console.error("Edge references non-existing node");
        return;
      };
      from.tmp = from.tmp || {};
      from.tmp.children = from.tmp.children || [];
      from.tmp.children.push(to);
      to.tmp = to.tmp || {};
      to.tmp.parents = to.tmp.parents || [];
      to.tmp.parents.push(from);
      return [from, edge[1], to, edge[3]] as const;
    })
      .filter(Boolean) as unknown as [Node, number, Node, string][]
    );

    this.nodes.set(nodes);

  }

  async load(graph: Graph) {
    this.graph = graph;
    this.status.set("loading");

    for (const node of this.graph.nodes) {
      const nodeType = this.nodeRegistry.getNode(node.type);
      if (!nodeType) {
        console.error(`Node type not found: ${node.type}`);
        this.status.set("error");
        return;
      }
      node.tmp = node.tmp || {};
      node.tmp.type = nodeType;
    }

    this._init(this.graph);

    setTimeout(() => {
      this.status.set("idle");
      this.save();
    }, 100)
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
      return toParents.splice(toParents.indexOf(from));
    } else if (fromParents.includes(to)) {
      return [...fromParents.splice(fromParents.indexOf(to)), from];
    } else {
      // these two nodes are not connected
      return;
    }
  }

  removeNode(node: Node) {
    const edges = this._edges.filter((edge) => edge[0].id !== node.id && edge[2].id !== node.id);
    this.edges.set(edges);

    this.nodes.update((nodes) => {
      nodes.delete(node.id);
      return nodes;
    });
    this.save();
  }

  createEdge(from: Node, fromSocket: number, to: Node, toSocket: string) {

    const existingEdges = this.getEdgesToNode(to);

    // check if this exact edge already exists
    const existingEdge = existingEdges.find(e => e[0].id === from.id && e[1] === fromSocket && e[3] === toSocket);
    if (existingEdge) {
      console.log("Edge already exists");
      console.log(existingEdge)
      return;
    };

    // check if socket types match
    const fromSocketType = from.tmp?.type?.outputs?.[fromSocket];
    const toSocketType = to.tmp?.type?.inputs?.[toSocket]?.type;

    if (fromSocketType !== toSocketType) {
      console.error(`Socket types do not match: ${fromSocketType} !== ${toSocketType}`);
      return;
    }

    this.edges.update((edges) => {
      return [...edges.filter(e => e[2].id !== to.id || e[3] !== toSocket), [from, fromSocket, to, toSocket]];
    });

    this.save();
  }

  save() {
    this.emit("save", this.serialize());
    this.history.save();
  }

  getParentsOfNode(node: Node) {
    const parents = [];
    const stack = node.tmp?.parents?.slice(0);
    while (stack?.length) {
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
          if (inputs[key].type === ownType && edges.get(node.id) !== key) {
            sockets.push([node, key]);
          }
        }
      }
    }

    return sockets;

  }

  removeEdge(edge: Edge) {
    const id0 = edge[0].id;
    const sid0 = edge[1];
    const id2 = edge[2].id;
    const sid2 = edge[3];
    this.edges.update((edges) => {
      return edges.filter((e) => e[0].id !== id0 || e[1] !== sid0 || e[2].id !== id2 || e[3] !== sid2);
    });
    this.save();
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

  createTemplate<T extends keyof typeof templates>(template: T, ...args: Parameters<typeof templates[T]>) {
    switch (template) {
      case "grid":
        return templates.grid(args?.[0] || 5, args?.[1] || 5);
      case "tree":
        return templates.tree(args?.[0] || 4);
      default:
        throw new Error(`Template not found: ${template}`);
    }


  }

}

