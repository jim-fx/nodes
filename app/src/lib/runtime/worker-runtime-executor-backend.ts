import { MemoryRuntimeExecutor } from "./runtime-executor";
import { RemoteNodeRegistry, IndexDBCache } from "@nodarium/registry";
import type { Graph } from "@nodarium/types";
import { createPerformanceStore } from "@nodarium/utils";
import { MemoryRuntimeCache } from "./runtime-executor-cache";

const cache = new MemoryRuntimeCache();
const indexDbCache = new IndexDBCache("node-registry");
const nodeRegistry = new RemoteNodeRegistry("", indexDbCache);
const executor = new MemoryRuntimeExecutor(nodeRegistry, cache);

const performanceStore = createPerformanceStore();
executor.perf = performanceStore;

export async function executeGraph(
  graph: Graph,
  settings: Record<string, unknown>,
): Promise<Int32Array> {
  await nodeRegistry.load(graph.nodes.map((n) => n.type));
  performanceStore.startRun();
  let res = await executor.execute(graph, settings);
  performanceStore.stopRun();
  return res;
}

export function getPerformanceData() {
  return performanceStore.get();
}
