import {
  NodeDefinitionSchema,
  type AsyncCache,
  type NodeDefinition,
  type NodeRegistry,
} from "@nodes/types";
import { createLogger, createWasmWrapper } from "@nodes/utils";

const log = createLogger("node-registry");
// log.mute();

export class RemoteNodeRegistry implements NodeRegistry {
  status: "loading" | "ready" | "error" = "loading";
  private nodes: Map<string, NodeDefinition> = new Map();

  async fetchJson(url: string) {
    const response = await fetch(`${this.url}/${url}`);

    if (!response.ok) {
      log.error(`Failed to load ${url}`, { response, url, host: this.url });
      throw new Error(`Failed to load ${url}`);
    }

    return response.json();
  }

  async fetchArrayBuffer(url: string) {
    const response = await fetch(`${this.url}/${url}`);
    if (!response.ok) {
      log.error(`Failed to load ${url}`, { response, url, host: this.url });
      throw new Error(`Failed to load ${url}`);
    }

    return response.arrayBuffer();
  }

  constructor(
    private url: string,
    private cache?: AsyncCache<ArrayBuffer>,
  ) {}

  async fetchUsers() {
    return this.fetchJson(`nodes/users.json`);
  }

  async fetchUser(userId: `${string}`) {
    return this.fetchJson(`user/${userId}.json`);
  }

  async fetchCollection(userCollectionId: `${string}/${string}`) {
    return this.fetchJson(`nodes/${userCollectionId}.json`);
  }

  async fetchNodeDefinition(nodeId: `${string}/${string}/${string}`) {
    return this.fetchJson(`nodes/${nodeId}.json`);
  }

  private async fetchNodeWasm(nodeId: `${string}/${string}/${string}`) {
    const res = await Promise.race([
      this.fetchArrayBuffer(`nodes/${nodeId}.wasm`),
      this.cache?.get(nodeId),
    ]);

    if (!res) {
      throw new Error(`Failed to load node wasm ${nodeId}`);
    }

    return res;
  }

  async load(nodeIds: `${string}/${string}/${string}`[]) {
    const a = performance.now();

    const nodes = await Promise.all(
      [...new Set(nodeIds).values()].map(async (id) => {
        if (this.nodes.has(id)) {
          return this.nodes.get(id)!;
        }

        const wasmBuffer = await this.fetchNodeWasm(id);

        return this.register(wasmBuffer);
      }),
    );

    const duration = performance.now() - a;

    log.group("loaded nodes in", duration, "ms");
    log.info(nodeIds);
    log.info(nodes);
    log.groupEnd();
    this.status = "ready";

    return nodes;
  }

  async register(wasmBuffer: ArrayBuffer) {
    const wrapper = createWasmWrapper(wasmBuffer);

    const definition = NodeDefinitionSchema.safeParse(wrapper.get_definition());

    if (definition.error) {
      console.error(definition.error);
      throw definition.error;
    }

    if (this.cache) {
      await this.cache.set(definition.data.id, wasmBuffer);
    }

    let node = {
      ...definition.data,
      execute: wrapper.execute,
    };

    this.nodes.set(definition.data.id, node);

    return node;
  }

  getNode(id: string) {
    return this.nodes.get(id);
  }

  getAllNodes() {
    return [...this.nodes.values()];
  }
}
