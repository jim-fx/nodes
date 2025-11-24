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

  fetch: typeof fetch = globalThis.fetch.bind(globalThis);

  constructor(
    private url: string,
    private cache?: AsyncCache<ArrayBuffer>,
  ) {}

  async fetchUsers() {
    const response = await this.fetch(`${this.url}/nodes/users.json`);
    if (!response.ok) {
      throw new Error(`Failed to load users`);
    }
    return response.json();
  }

  async fetchUser(userId: `${string}`) {
    const response = await this.fetch(`${this.url}/user/${userId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load user ${userId}`);
    }
    return response.json();
  }

  async fetchCollection(userCollectionId: `${string}/${string}`) {
    const response = await this.fetch(
      `${this.url}/nodes/${userCollectionId}.json`,
    );
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
    return response.json();
  }

  private async fetchNodeWasm(nodeId: `${string}/${string}/${string}`) {
    const fetchNode = async () => {
      const response = await this.fetch(`${this.url}/nodes/${nodeId}.wasm`);
      return response.arrayBuffer();
    };

    const res = await Promise.race([fetchNode(), this.cache?.get(nodeId)]);

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
