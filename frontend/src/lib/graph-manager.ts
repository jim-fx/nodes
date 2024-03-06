import { writable, type Writable } from "svelte/store";
import type { Graph, NodeRegistry as INodeRegistry, NodeType, Node } from "./types";
import { snapToGrid } from "./helpers";

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
  edges: { from: string, to: string }[] = [];

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

  getNode(id: string) {
    return this.nodes.find((node) => node.id === id);
  }

  public getNodeType(id: string): NodeType {
    return this.nodeRegistry.getNode(id)!;
  }

  public getEdges() {
    return this.edges
      .map((edge) => {
        const from = this.nodes.find((node) => node.id === edge.from);
        const to = this.nodes.find((node) => node.id === edge.to);
        if (!from || !to) return;
        return [from, to] as const;
      })
      .filter(Boolean) as unknown as [Node, Node][];
  }


  static createEmptyGraph(): GraphManager {

    const graph: Graph = {
      edges: [],
      nodes: [],
    };

    for (let i = 0; i < 40; i++) {
      const x = i % 20;
      const y = Math.floor(i / 20);

      graph.nodes.push({
        id: `${i.toString()}`,
        tmp: {
          visible: false,
        },
        position: {
          x: x * 7.5,
          y: y * 5,
        },
        props: i == 0 ? { value: 0 } : {},
        type: i == 0 ? "input/float" : "math",
      });

      graph.edges.push({
        from: i.toString(),
        to: (i + 1).toString(),
      });
    }

    return new GraphManager(graph);
  }


}


