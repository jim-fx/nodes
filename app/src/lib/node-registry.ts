import type { NodeRegistry, NodeType } from "@nodes/types";

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
    execute: (op_type: number, a: number, b: number) => {
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

  private nodes: Map<string, NodeType> = new Map();

  constructor(private url: string) { }

  async load(nodeIds: string[]) {
    const a = performance.now();
    nodeIds.push("max/plantarium/random");
    nodeIds.push("max/plantarium/float");
    for (const id of nodeIds) {
      const nodeUrl = `${this.url}/n/${id}`;
      const response = await fetch(nodeUrl);
      const wasmResponse = await fetch(`${nodeUrl}/wasm`);
      const wrapperReponse = await fetch(`${nodeUrl}/wrapper`);
      if (!wrapperReponse.ok) {
        throw new Error(`Failed to load node ${id}`);
      }

      let wrapperCode = await wrapperReponse.text();
      wrapperCode = wrapperCode.replace("wasm = val;", `if(wasm) return;
wasm = val;`);
      const wasmWrapper = await import(/*@vite-ignore*/`data:text/javascript;base64,${btoa(wrapperCode)}`);

      const module = new WebAssembly.Module(await wasmResponse.arrayBuffer());
      const instance = new WebAssembly.Instance(module, { ["./index_bg.js"]: wasmWrapper });
      wasmWrapper.__wbg_set_wasm(instance.exports);

      if (!response.ok) {
        throw new Error(`Failed to load node ${id}`);
      }
      const node = await response.json();
      node.execute = wasmWrapper.execute;
      this.nodes.set(id, node);
    }

    const duration = performance.now() - a;

    log.log("loaded nodes in", duration, "ms");
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

