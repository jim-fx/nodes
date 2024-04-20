import type { NodeRegistry, NodeType } from "@nodes/types";
import { createWasmWrapper } from "@nodes/utils";
import { createLogger } from "./helpers";

const log = createLogger("node-registry");
export class RemoteNodeRegistry implements NodeRegistry {

  status: "loading" | "ready" | "error" = "loading";
  private nodes: Map<string, NodeType> = new Map();

  constructor(private url: string) { }

  async loadNode(id: `${string}/${string}/${string}`) {
    const wasmResponse = await this.fetchNode(id);

    // Setup Wasm wrapper
    const wrapper = createWasmWrapper();
    const module = new WebAssembly.Module(wasmResponse);
    const instance = new WebAssembly.Instance(module, { ["./index_bg.js"]: wrapper });
    wrapper.setInstance(instance);

    const definition = wrapper.get_definition();

    return {
      ...definition,
      id,
      execute: wrapper.execute
    };
  }

  async fetchUsers() {
    const response = await fetch(`${this.url}/nodes/users.json`);
    if (!response.ok) {
      throw new Error(`Failed to load users`);
    }
    return response.json();
  }

  async fetchUser(userId: `${string}`) {
    const response = await fetch(`${this.url}/nodes/${userId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load user ${userId}`);
    }
    return response.json();
  }

  async fetchCollection(userCollectionId: `${string}/${string}`) {
    const response = await fetch(`${this.url}/nodes/${userCollectionId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load collection ${userCollectionId}`);
    }
    return response.json();
  }

  async fetchNode(nodeId: `${string}/${string}/${string}`) {
    const response = await fetch(`${this.url}/nodes/${nodeId}.wasm`);
    if (!response.ok) {
      throw new Error(`Failed to load node wasm ${nodeId}`);
    }
    return response.arrayBuffer();
  }

  async fetchNodeDefinition(nodeId: `${string}/${string}/${string}`) {
    const response = await fetch(`${this.url}/nodes/${nodeId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load node definition ${nodeId}`);
    }
    return response.json()
  }

  async load(nodeIds: `${string}/${string}/${string}`[]) {
    const a = performance.now();

    const nodes = await Promise.all(nodeIds.map(id => this.loadNode(id)));

    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }

    const duration = performance.now() - a;

    log.log("loaded nodes in", duration, "ms");
    this.status = "ready";

    return nodes
  }

  getNode(id: string) {
    return this.nodes.get(id);
  }

  getAllNodes() {
    return [...this.nodes.values()];
  }
}
