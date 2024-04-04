import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async function GET({ fetch }) {
  const d = await fetch("/max/plantarium/math/wasm");
  const wrapWasm = await import("./wrap-wasm");
  const module = new WebAssembly.Module(await d.arrayBuffer());
  const instance = new WebAssembly.Instance(module, { "./math_bg.js": wrapWasm });
  wrapWasm.__wbg_set_wasm(instance.exports);
  const id = wrapWasm.get_id();
  const outputs = wrapWasm.get_outputs();
  const inputTypes = JSON.parse(wrapWasm.get_input_types());
  return json({ id, outputs, inputs: inputTypes, });
}