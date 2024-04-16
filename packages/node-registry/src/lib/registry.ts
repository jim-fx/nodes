import { createWasmWrapper } from "@nodes/utils"



export async function getNodeWasm(id: `${string}/${string}/${string}`) {

  const wasmResponse = await fetch(`/n/${id}/wasm`);

  if (!wasmResponse.ok) {
    throw new Error(`Failed to load node ${id}`);
  }

  const wrapper = createWasmWrapper();
  const module = new WebAssembly.Module(await wasmResponse.arrayBuffer());
  const instance = new WebAssembly.Instance(module, { ["./index_bg.js"]: wrapper });
  wrapper.setInstance(instance)

  return wrapper;
}


export async function getNode(id: `${string}/${string}/${string}`) {

  const wrapper = await getNodeWasm(id);

  const outputs = wrapper?.get_outputs?.() || [];
  const rawInputs = wrapper.get_inputs();
  try {
    const inputTypes = JSON.parse(rawInputs);
    return { id, outputs, inputs: inputTypes }
  } catch (e) {
    console.log(rawInputs);
    console.log("Failed to parse input types for node", { id, rawInputs });
  }


}
