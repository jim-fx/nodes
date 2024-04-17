import type { NodeRegistry, NodeType } from "@nodes/types";
import { createWasmWrapper } from "@nodes/utils";

import { createLogger } from "./helpers";

const nodeTypes: NodeType[] = [
  {
    id: "max/plantarium/float",
    inputs: {
      "value": { type: "float", value: 0.1, internal: true },
    },
    outputs: ["float"],
    execute: (value) => { return value; }
  },
  {
    id: "max/plantarium/math",
    inputs: {
      "op_type": { label: "type", type: "select", labels: ["add", "subtract", "multiply", "divide"], value: 0 },
      "a": { type: "float" },
      "b": { type: "float" },
    },
    outputs: ["float"],
    execute: ([op_type, a, b]: number[]) => {
      switch (op_type) {
        case 0: return a + b;
        case 1: return a - b;
        case 2: return a * b;
        case 3: return a / b;
      }
    }
  },
  {
    id: "max/plantarium/output",
    inputs: {
      "input": { type: "float" },
    },
    outputs: [],
  }
]


const log = createLogger("node-registry");
export class RemoteNodeRegistry implements NodeRegistry {


  status: "loading" | "ready" | "error" = "loading";
  private nodes: Map<string, NodeType> = new Map();

  constructor(private url: string) { }

  private async loadNode(id: string) {
    const nodeUrl = `${this.url}/n/${id}`;
    const [response, wasmResponse] = await Promise.all([fetch(nodeUrl), fetch(`${nodeUrl}/wasm`)]);
    if (!wasmResponse.ok || !response.ok) {
      this.status = "error";
      throw new Error(`Failed to load node ${id}`);
    }

    // Setup Wasm wrapper
    const wrapper = createWasmWrapper();
    const module = new WebAssembly.Module(await wasmResponse.arrayBuffer());
    const instance = new WebAssembly.Instance(module, { ["./index_bg.js"]: wrapper });
    wrapper.setInstance(instance);

    const node = await response.json();
    node.execute = wrapper.execute;
    return node;
  }

  async load(nodeIds: string[]) {
    const a = performance.now();

    nodeIds.push("max/plantarium/random");
    nodeIds.push("max/plantarium/float");
    nodeIds.push("max/plantarium/triangle");
    nodeIds.push("max/plantarium/output");
    nodeIds.push("max/plantarium/array");
    nodeIds.push("max/plantarium/sum");
    nodeIds.push("max/plantarium/stem");
    nodeIds.push("max/plantarium/box");
    nodeIds.push("max/plantarium/math");

    const nodes = await Promise.all(nodeIds.map(id => this.loadNode(id)));

    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }

    const duration = performance.now() - a;

    log.log("loaded nodes in", duration, "ms");
    this.status = "ready";
  }

  getNode(id: string) {
    return this.nodes.get(id);
  }

  getAllNodes() {
    return [...this.nodes.values()];
  }
}

export class MemoryNodeRegistry implements NodeRegistry {

  status: "loading" | "ready" | "error" = "ready";

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

