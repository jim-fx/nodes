/// <reference lib="webworker" />

import { NodeDefinitionSchema } from "../validations/types.ts";
import { WorkerMessage } from "./messages.ts";
import { createWasmWrapper } from "./utils.ts";

const workerSelf = self as DedicatedWorkerGlobalScope & {
  postMessage: (message: WorkerMessage) => void;
};

function extractDefinition(wasmCode: ArrayBuffer) {
  try {
    const wasm = createWasmWrapper(wasmCode);

    const definition = wasm.get_definition();

    const p = NodeDefinitionSchema.safeParse(definition);

    if (!p.success) {
      workerSelf.postMessage({ action: "error", error: p.error });
      return;
    }

    workerSelf.postMessage({ action: "result", result: p.data });
  } catch (e) {
    console.log("HEEERE", e);
    workerSelf.postMessage({ action: "error", error: e });
  }
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  switch (e.data.action) {
    case "extract-definition":
      extractDefinition(e.data.content);
      self.close();
      break;
    default:
      throw new Error("Unknown action: " + e.data.action);
  }
};
