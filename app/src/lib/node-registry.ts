import type { NodeRegistry, NodeType } from "@nodes/types";

import * as d from "plantarium-nodes-math";

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
    id: d.get_id(),
    inputs: JSON.parse(d.get_input_types()),
    outputs: d.get_outputs(),
    execute: ({ op_type, a, b }) => {
      return d.execute(op_type, a, b);
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
  getAllNodes(): NodeType[] {
    return [...nodeTypes];
  }
}

