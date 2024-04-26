import type { RequestHandler } from "./$types";
import { MemoryRuntimeExecutor } from "$lib/runtime-executor";
import { RemoteNodeRegistry } from "$lib/node-registry-client";
import { createPerformanceStore } from "$lib/performance";

const registry = new RemoteNodeRegistry("");
const runtime = new MemoryRuntimeExecutor(registry);
const performanceStore = createPerformanceStore();
runtime.perf = performanceStore;

export const prerender = false;

export const POST: RequestHandler = async ({ request, fetch }) => {

  const { graph, settings } = await request.json();

  if (!graph || !settings) {
    return new Response("Invalid request", { status: 400 });
  }

  registry.fetch = fetch;

  await registry.load(graph.nodes.map(node => node.type))

  const res = await runtime.execute(graph, settings);

  let headers: Record<string, string> = { "Content-Type": "application/octet-stream" };
  if (runtime.perf) {
    headers["performance"] = JSON.stringify(runtime.perf.get());
  }

  return new Response(res, { headers });

}
