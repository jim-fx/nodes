export async function getNodeWrapper(id: `${string}/${string}/${string}`) {

  const wrapperReponse = await fetch(`/n/${id}/wrapper`);
  if (!wrapperReponse.ok) {
    throw new Error(`Failed to load node ${id}`);
  }

  let wrapperCode = await wrapperReponse.text();
  wrapperCode = wrapperCode.replace("wasm = val;", `if(wasm) return;
wasm = val;`);
  const wasmWrapper = await import(/*@vite-ignore*/`data:text/javascript;base64,${btoa(wrapperCode)}#${id}${Math.random().toString().slice(2)}`);

  return wasmWrapper;
}

export async function getNodeWasm(id: `${string}/${string}/${string}`): Promise<WebAssembly.Instance> {

  const wasmResponse = await fetch(`/n/${id}/wasm`);

  if (!wasmResponse.ok) {
    throw new Error(`Failed to load node ${id}`);
  }

  const wasmWrapper = await getNodeWrapper(id);

  const module = new WebAssembly.Module(await wasmResponse.arrayBuffer());
  const instance = new WebAssembly.Instance(module, { ["./index_bg.js"]: wasmWrapper });
  wasmWrapper.__wbg_set_wasm(instance.exports);

  return wasmWrapper;
}


export async function getNode(id: `${string}/${string}/${string}`) {

  const wrapper = await getNodeWasm(id);

  const outputs = wrapper.get_outputs();
  const rawInputs = wrapper.get_input_types();
  try {
    const inputTypes = JSON.parse(rawInputs);
    return { id, outputs, inputs: inputTypes }
  } catch (e) {
    console.log(rawInputs);
    console.log("Failed to parse input types for node", { id, rawInputs });
  }


}
