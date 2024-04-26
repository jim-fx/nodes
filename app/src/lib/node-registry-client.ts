import type { NodeRegistry, NodeDefinition } from "@nodes/types";
import { createWasmWrapper } from "@nodes/utils";
import { createLogger } from "./helpers";

const log = createLogger("node-registry");
log.mute();

export class RemoteNodeRegistry implements NodeRegistry {

  status: "loading" | "ready" | "error" = "loading";
  private nodes: Map<string, NodeDefinition> = new Map();

  fetch: typeof fetch = globalThis.fetch.bind(globalThis);

  constructor(private url: string) { }

  async fetchUsers() {
    const response = await this.fetch(`${this.url}/nodes/users.json`);
    if (!response.ok) {
      throw new Error(`Failed to load users`);
    }
    return response.json();
  }

  async fetchUser(userId: `${string}`) {
    const response = await this.fetch(`${this.url}/nodes/${userId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load user ${userId}`);
    }
    return response.json();
  }

  async fetchCollection(userCollectionId: `${string}/${string}`) {
    const response = await this.fetch(`${this.url}/nodes/${userCollectionId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load collection ${userCollectionId}`);
    }
    return response.json();
  }

  async fetchNodeDefinition(nodeId: `${string}/${string}/${string}`) {
    const response = await this.fetch(`${this.url}/nodes/${nodeId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load node definition ${nodeId}`);
    }
    return response.json()
  }

  async load(nodeIds: `${string}/${string}/${string}`[]) {
    const a = performance.now();

    const nodes = await Promise.all(nodeIds.map(async id => {

      if (this.nodes.has(id)) {
        return this.nodes.get(id)!;
      }

      const response = await this.fetch(`${this.url}/nodes/${id}.wasm`);
      if (!response.ok) {
        throw new Error(`Failed to load node wasm ${id}`);
      }

      const wasmBuffer = await response.arrayBuffer();

      const wrapper = createWasmWrapper(wasmBuffer);

      const definition = wrapper.get_definition();

      return {
        ...definition,
        execute: wrapper.execute
      };
    }));

    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }

    const duration = performance.now() - a;

    log.group("loaded nodes in", duration, "ms");
    log.info(nodeIds);
    log.info(nodes);
    log.groupEnd();
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
