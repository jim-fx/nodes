import {
  NodeDefinitionSchema,
  type AsyncCache,
  type NodeDefinition,
  type NodeRegistry,
} from "@nodarium/types";
import { createLogger, createWasmWrapper } from "@nodarium/utils";

const log = createLogger("node-registry");
log.mute();

export class RemoteNodeRegistry implements NodeRegistry {
  status: "loading" | "ready" | "error" = "loading";
  private nodes: Map<string, NodeDefinition> = new Map();

  constructor(
    private url: string,
    private cache?: AsyncCache<ArrayBuffer | string>,
  ) { }

  async fetchJson(url: string, skipCache = false) {

    const finalUrl = `${this.url}/${url}`;

    if (!skipCache && this.cache) {
      const cachedValue = await this.cache?.get<string>(finalUrl);
      if (cachedValue) {
        // fetch again in the background, maybe implement that only refetch after a certain time
        this.fetchJson(url, true)
        return JSON.parse(cachedValue);
      }
    }

    const response = await fetch(finalUrl);

    if (!response.ok) {
      log.error(`Failed to load ${url}`, { response, url, host: this.url });
      throw new Error(`Failed to load ${url}`);
    }

    const result = await response.json();

    this.cache?.set(finalUrl, JSON.stringify(result));

    return result;
  }

  async fetchArrayBuffer(url: string, skipCache = false) {

    const finalUrl = `${this.url}/${url}`;

    if (!skipCache && this.cache) {
      const cachedNode = await this.cache?.get<ArrayBuffer>(finalUrl);
      if (cachedNode) {
        // fetch again in the background, maybe implement that only refetch after a certain time
        this.fetchArrayBuffer(url, true)
        return cachedNode;
      }
    }

    const response = await fetch(finalUrl);
    if (!response.ok) {
      log.error(`Failed to load ${url}`, { response, url, host: this.url });
      throw new Error(`Failed to load ${url}`);
    }

    const buffer = await response.arrayBuffer();
    this.cache?.set(finalUrl, buffer);
    return buffer;
  }

  async fetchUsers() {
    return this.fetchJson(`nodes/users.json`);
  }

  async fetchUser(userId: `${string}`) {
    return this.fetchJson(`user/${userId}.json`);
  }

  async fetchCollection(userCollectionId: `${string}/${string}`) {
    const col = await this.fetchJson(`nodes/${userCollectionId}.json`);
    return col
  }

  async fetchNodeDefinition(nodeId: `${string}/${string}/${string}`) {
    return this.fetchJson(`nodes/${nodeId}.json`);
  }

  private async fetchNodeWasm(nodeId: `${string}/${string}/${string}`) {

    const node = await this.fetchArrayBuffer(`nodes/${nodeId}.wasm`);
    if (!node) {
      throw new Error(`Failed to load node wasm ${nodeId}`);
    }

    return node;
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
