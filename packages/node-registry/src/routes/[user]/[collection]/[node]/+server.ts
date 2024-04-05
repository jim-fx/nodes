import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async function GET({ fetch, params }) {
  const wasmResponse = await fetch(`/${params.user}/${params.collection}/${params.node}/wasm`);

  let wrapperCode = await (await fetch(`/${params.user}/${params.collection}/${params.node}/wrapper`)).text();
  wrapperCode = wrapperCode.replace("wasm = val;", `if(wasm) return;
wasm = val;`);
  const wasmWrapper = await import(`data:text/javascript;base64,${btoa(wrapperCode)}`);

  const module = new WebAssembly.Module(await wasmResponse.arrayBuffer());
  const instance = new WebAssembly.Instance(module, { ["./index_bg.js"]: wasmWrapper });
  wasmWrapper.__wbg_set_wasm(instance.exports);
  const id = wasmWrapper.get_id();
  const outputs = wasmWrapper.get_outputs();
  const inputTypes = JSON.parse(wasmWrapper.get_input_types());
  return json({ id, outputs, inputs: inputTypes, });
}
