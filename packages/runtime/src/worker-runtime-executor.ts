/// <reference types="vite-plugin-comlink/client" />

import type { Graph, RuntimeExecutor } from "@nodes/types";

export class WorkerRuntimeExecutor implements RuntimeExecutor {
  private worker = new ComlinkWorker<typeof import('./worker-runtime-executor-backend.ts')>(new URL("./worker-runtime-executor-backend.ts", import.meta.url));
  constructor() {
  }
  async execute(graph: Graph, settings: Record<string, unknown>) {
    return this.worker.executeGraph(graph, settings);
  }
  async getPerformanceData() {
    return this.worker.getPerformanceData();
  }
}

