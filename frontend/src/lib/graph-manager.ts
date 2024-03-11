import { get, writable, type Writable } from "svelte/store";
import type { Graph, NodeRegistry as INodeRegistry, NodeType, Node, Edge } from "./types";

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

  private _nodes: Node[] = [];
  nodes: Writable<Node[]> = writable([]);
  private _edges: Edge[] = [];
  edges: Writable<Edge[]> = writable([]);

  private constructor(private graph: Graph, private nodeRegistry: NodeRegistry = new NodeRegistry()) {
    this.nodes.subscribe((nodes) => {
      this._nodes = nodes;
    });
    this.edges.subscribe((edges) => {
      this._edges = edges;
    });
  }

  async load() {

    const nodes = this.graph.nodes;

    for (const node of nodes) {
      const nodeType = this.getNodeType(node.type);
      if (!nodeType) {
        console.error(`Node type not found: ${node.type}`);
        this.status.set("error");
        return;
      }
      node.tmp = node.tmp || {};
      node.tmp.type = nodeType;
    }

    this.nodes.set(nodes);
    this.edges.set(this.graph.edges.map((edge) => {
      const from = this._nodes.find((node) => node.id === edge[0]);
      const to = this._nodes.find((node) => node.id === edge[2]);
      if (!from || !to) return;
      return [from, edge[1], to, edge[3]] as const;
    })
      .filter(Boolean) as unknown as [Node, number, Node, string][]
    );


    this.status.set("idle");
  }


  getNode(id: number) {
    return this._nodes.find((node) => node.id === id);
  }

  getPossibleSockets(node: Node, socketIndex: number, isInput: boolean): [Node, number][] {

    const nodeType = this.getNodeType(node.type);
    if (!nodeType) return [];

    const nodes = this._nodes.filter(n => n.id !== node.id);

    const sockets: [Node, number][] = []
    if (isInput) {

      const ownType = Object.values(nodeType?.inputs || {})[socketIndex].type;

      for (const node of nodes) {
        const nodeType = this.getNodeType(node.type);
        const inputs = nodeType?.outputs;
        if (!inputs) continue;
        for (let index = 0; index < inputs.length; index++) {
          if (inputs[index] === ownType) {
            sockets.push([node, index]);
          }
        }
      }

    } else {

      const ownType = nodeType.outputs?.[socketIndex];

      for (const node of nodes) {
        const nodeType = this.getNodeType(node.type);
        const inputs = nodeType?.inputs;
        const entries = Object.values(inputs || {});
        entries.map((input, index) => {
          if (input.type === ownType) {
            sockets.push([node, index]);
          }
        });
      }

    }

    return sockets;

  }

  getNodeType(id: string): NodeType {
    return this.nodeRegistry.getNode(id)!;
  }

  removeEdge(edge: Edge) {
    const id0 = edge[0].id;
    const sid0 = edge[1];
    const id2 = edge[2].id;
    const sid2 = edge[3];
    this.edges.update((edges) => {
      return edges.filter((e) => e[0].id !== id0 || e[1] !== sid0 || e[2].id !== id2 || e[3] !== sid2);
    });
  }

  getEdgesToNode(node: Node) {
    return this._edges
      .filter((edge) => edge[2].id === node.id)
      .map((edge) => {
        const from = this._nodes.find((node) => node.id === edge[0].id);
        const to = this._nodes.find((node) => node.id === edge[2].id);
        if (!from || !to) return;
        return [from, edge[1], to, edge[3]] as const;
      })
      .filter(Boolean) as unknown as [Node, number, Node, string][];
  }

  getEdgesFromNode(node: Node) {
    return this._edges
      .filter((edge) => edge[0] === node.id)
      .map((edge) => {
        const from = this._nodes.find((node) => node.id === edge[0]);
        const to = this._nodes.find((node) => node.id === edge[2]);
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
          x: x * 7.5,
          y: y * 10,
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
        x: width * 7.5,
        y: (height - 1) * 10,
      },
      type: "output",
      props: {},
    });

    return new GraphManager(graph);
  }


}


