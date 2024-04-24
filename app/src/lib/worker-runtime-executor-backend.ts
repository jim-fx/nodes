import { MemoryRuntimeExecutor } from "./runtime-executor";
import { RemoteNodeRegistry } from "./node-registry-client";
import type { Graph } from "@nodes/types";
import { createPerformanceStore } from "./performance";

const nodeRegistry = new RemoteNodeRegistry("");
const executor = new MemoryRuntimeExecutor(nodeRegistry);

const performanceStore = createPerformanceStore();
executor.perf = performanceStore;

export async function executeGraph(graph: Graph, settings: Record<string, unknown>): Promise<Int32Array> {
  await nodeRegistry.load(graph.nodes.map((n) => n.type));
  return executor.execute(graph, settings);
}

export function getPerformanceData() {
  return performanceStore.get();
}
