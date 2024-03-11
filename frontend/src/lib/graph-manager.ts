import { writable, type Writable } from "svelte/store";
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
      "a": { type: "float" },
      "b": { type: "float" },
    },
    outputs: ["float"],
  },
]

export class NodeRegistry implements INodeRegistry {
  getNode(id: string): NodeType | undefined {
    return nodeTypes.find((nodeType) => nodeType.id === id);
  }
}


export class GraphManager {

  status: Writable<"loading" | "idle" | "error"> = writable("loading");

  nodes: Node[] = [];
  edges: Edge[] = [];

  private constructor(private graph: Graph, private nodeRegistry: NodeRegistry = new NodeRegistry()) {
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
    }

    this.nodes = this.graph.nodes;
    this.edges = this.graph.edges;
    this.status.set("idle");
  }

  getNode(id: number) {
    return this.nodes.find((node) => node.id === id);
  }

  getPossibleSockets(node: Node, socketIndex: number, isInput: boolean): [Node, number][] {

    const nodeType = this.getNodeType(node.type);
    if (!nodeType) return [];

    const nodes = this.nodes.filter(n => n.id !== node.id);


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

  getEdges() {
    return this.edges
      .map((edge) => {
        const from = this.nodes.find((node) => node.id === edge.from);
        const to = this.nodes.find((node) => node.id === edge.to);
        if (!from || !to) return;
        return [from, edge.fromSocket, to, edge.toSocket] as const;
      })
      .filter(Boolean) as unknown as [Node, number, Node, number][];
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

      graph.edges.push({
        from: i,
        fromSocket: 0,
        to: (i + 1),
        toSocket: 0,
      });
    }

    return new GraphManager(graph);
  }


}


