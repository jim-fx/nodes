/// <reference lib="webworker" />

import { NodeDefinitionSchema } from "./types.ts";
import { createWasmWrapper } from "./utils.ts";

function extractDefinition(wasmCode: ArrayBuffer) {
  const wasm = createWasmWrapper(wasmCode);

  const definition = wasm.get_definition();

  const p = NodeDefinitionSchema.safeParse(definition);

  if (!p.success) {
    self.postMessage({ action: "error", error: p.error });
    return;
  }

  self.postMessage({ action: "result", result: p.data });
}

self.onmessage = (e) => {
  switch (e.data.action) {
    case "extract-definition":
      extractDefinition(e.data.content);
      self.close();
      break;
    default:
      throw new Error("Unknwon action", e.data.action);
  }
};
