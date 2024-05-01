import { MemoryRuntimeExecutor, MemoryRuntimeCache } from "./runtime-executor";
import { RemoteNodeRegistry } from "./node-registry-client";
import type { Graph } from "@nodes/types";
import { createPerformanceStore } from "./performance/store";

const cache = new MemoryRuntimeCache();
const nodeRegistry = new RemoteNodeRegistry("");
const executor = new MemoryRuntimeExecutor(nodeRegistry, cache);

const performanceStore = createPerformanceStore("worker");
executor.perf = performanceStore;

export async function executeGraph(graph: Graph, settings: Record<string, unknown>): Promise<Int32Array> {
  await nodeRegistry.load(graph.nodes.map((n) => n.type));
  performanceStore.startRun();
  let res = await executor.execute(graph, settings);
  performanceStore.stopRun();
  return res;
}

export function getPerformanceData() {
  return performanceStore.get();
}
