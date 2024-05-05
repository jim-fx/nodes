import type { Graph, RuntimeExecutor } from "@nodes/types";

export class RemoteRuntimeExecutor implements RuntimeExecutor {

  constructor(private url: string) { }

  async execute(graph: Graph, settings: Record<string, any>): Promise<Int32Array> {

    const res = await fetch(this.url, { method: "POST", body: JSON.stringify({ graph, settings }) });

    if (!res.ok) {
      throw new Error(`Failed to execute graph`);
    }

    return new Int32Array(await res.arrayBuffer());

  }
}
