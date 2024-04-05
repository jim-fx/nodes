import type { NodeRegistry, NodeType } from "@nodes/types";

function binaryArrayToNumber(binaryArray: number[]): number {
  let result = 0;
  for (let i = 0; i < binaryArray.length; i++) {
    result = (result << 1) + binaryArray[i];
  }
  return result;
}

const nodeTypes: NodeType[] = [
  {
    id: "max/plantarium/input-float",
    inputs: {
      "value": { type: "float", value: 0.1, internal: true },
    },
    outputs: ["float"],
    execute: ({ value }) => { return [0, 1, 0, value] }
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

      const res = [1, 3, -1, op_type, 0, 0];

      const bitmask = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      console.log({ a, b });

      if (Array.isArray(a)) {
        res[4] = res.length;
        res.push(...a);
        bitmask[1] = 1;
        console.log("A", res.length, a.length);
      } else {
        res[4] = a;
      }

      if (Array.isArray(b)) {
        res[5] = res.length;
        res.push(...b);
        bitmask[2] = 1;
      } else {
        res[5] = b;
      }

      res[2] = binaryArrayToNumber(bitmask);

      return res
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

