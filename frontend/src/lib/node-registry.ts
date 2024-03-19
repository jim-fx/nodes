import type { NodeRegistry, NodeType } from "./types";

const nodeTypes: NodeType[] = [
  {
    id: "input/float",
    inputs: {
      "value": { type: "float", value: 0.1, internal: true },
    },
    outputs: ["float"],
    execute: ({ value }) => { return value }
  },
  {
    id: "math",
    inputs: {
      "type": { type: "select", options: ["add", "subtract", "multiply", "divide"], internal: true, value: "multiply" },
      "a": { type: "float", value: 2 },
      "b": { type: "float", value: 2 },
    },
    outputs: ["float"],
    execute: (inputs) => {
      const a = inputs.a as number;
      const b = inputs.b as number;
      switch (inputs.type) {
        case "add": return a + b;
        case "subtract": return a - b;
        case "multiply": return a * b;
        case "divide": return a / b;
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

export class MemoryNodeRegistry implements NodeRegistry {
  getNode(id: string): NodeType | undefined {
    return nodeTypes.find((nodeType) => nodeType.id === id);
  }
}

