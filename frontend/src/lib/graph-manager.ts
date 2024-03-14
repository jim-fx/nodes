import { writable, type Writable } from "svelte/store";
import type { Graph, NodeRegistry as INodeRegistry, NodeType, Node, Edge, Socket } from "./types";
import { HistoryManager } from "./history-manager";

const nodeTypes: NodeType[] = [
  {
    id: "input/float",
    inputs: {
      "value": { type: "float" },
    },
    outputs: ["float"],
  },
  {
    id: "math",
    inputs: {
      "type": { type: "select", options: ["add", "subtract", "multiply", "divide"], internal: true },
      "a": { type: "float" },
      "b": { type: "float" },
    },
    outputs: ["float"],
  },
  {
    id: "output",
    inputs: {
      "input": { type: "float" },
    },
    outputs: [],
  }
]

export class NodeRegistry implements INodeRegistry {
  getNode(id: string): NodeType | undefined {
    return nodeTypes.find((nodeType) => nodeType.id === id);
  }
}


export class GraphManager {

  status: Writable<"loading" | "idle" | "error"> = writable("loading");

  private _nodes: Map<number, Node> = new Map();
  nodes: Writable<Map<number, Node>> = writable(new Map());
  private _edges: Edge[] = [];
  edges: Writable<Edge[]> = writable([]);

  history: HistoryManager = new HistoryManager(this);

  private constructor(private graph: Graph, private nodeRegistry: NodeRegistry = new NodeRegistry()) {
    this.nodes.subscribe((nodes) => {
      this._nodes = nodes;
    });
    this.edges.subscribe((edges) => {
      this._edges = edges;
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

  async load() {

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

    this.status.set("idle");
    this.history.save();
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

  private updateNodeParents(node: Node) {
  }

  removeNode(node: Node) {
    const edges = this._edges.filter((edge) => edge[0].id !== node.id && edge[2].id !== node.id);
    this.edges.set(edges);

    this.nodes.update((nodes) => {
      nodes.delete(node.id);
      return nodes;
    });
    this.history.save();
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
    this.history.save();
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

  static createEmptyGraph({ width = 20, height = 20 } = {}): GraphManager {

    const graph: Graph = {
      edges: [],
      nodes: [],
    };

    const amount = width * height;

    for (let i = 0; i < amount; i++) {
      const x = i % width;
      const y = Math.floor(i / height);

      graph.nodes.push({
        id: i,
        tmp: {
          visible: false,
        },
        position: {
          x: x * 15,
          y: y * 20,
        },
        props: i == 0 ? { value: 0 } : {},
        type: i == 0 ? "input/float" : "math",
      });

      graph.edges.push([i, 0, i + 1, i === amount - 1 ? "input" : "a",]);
    }

    graph.nodes.push({
      id: amount,
      tmp: {
        visible: false,
      },
      position: {
        x: width * 15,
        y: (height - 1) * 20,
      },
      type: "output",
      props: {},
    });

    return new GraphManager(graph);
  }

}

