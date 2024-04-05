import type { NodeRegistry, NodeType } from "@nodes/types";

import * as d from "plantarium-nodes-math";

const nodeTypes: NodeType[] = [
  {
    id: "max/plantarium/input-float",
    inputs: {
      "value": { type: "float", value: 0.1, internal: true },
    },
    outputs: ["float"],
    execute: ({ value }) => { return [0, value] }
  },
  {
    id: "max/plantarium/math",
    inputs: {
      "op_type": { title: "type", type: "select", labels: ["add", "subtract", "multiply", "divide"], value: 0 },
      "a": { type: "float" },
      "b": { type: "float" },
    },
    outputs: ["float"],
    execute: ({ op_type, a, b }: { op_type: number, a: number, b: number }) => {
      switch (op_type) {
        case 0: return a + b;
        case 1: return a - b;
        case 2: return a * b;
        case 3: return a / b;
      }
    }
  },
  {
    id: "output",
    inputs: {
      "input": { type: "float" },
    },
    outputs: [],
  }
]

export class RemoteNodeRegistry implements NodeRegistry {

  private nodes: Map<string, NodeType> = new Map();

  constructor(private url: string) { }

  async load(nodeIds: string[]) {
    for (const id of nodeIds) {
      const response = await fetch(`${this.url}/nodes/${id}`);
      const node = this.getNode(id);
      if (node) {
        this.nodes.set(id, node);
      }
    }
  }

  getNode(id: string) {
    return this.nodes.get(id);
  }

  getAllNodes() {
    return [...this.nodes.values()];
  }
}

export class MemoryNodeRegistry implements NodeRegistry {

  async load(nodeIds: string[]) {
    // Do nothing
  }

  getNode(id: string) {
    return nodeTypes.find((nodeType) => nodeType.id === id);
  }
  getAllNodes() {
    return [...nodeTypes];
  }
}

