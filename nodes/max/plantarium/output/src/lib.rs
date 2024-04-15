// use utils::decode_float;
use utils::evaluate_args;
use wasm_bindgen::prelude::*;
// use web_sys::console;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec![]
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    r#"{
      "input": { "type": "float", "value": 0.0, "external": true }
    }"#
    .to_string()
}
#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    // utils::set_panic_hook();

    // console::log_1(&format!("WASM(output_node): input: {:?}", args).into());

    evaluate_args(args)
    // let decoded = decode_float(result[0], result[1]);

    // console::log_1(&format!("WASM: output: {:?}", decoded).into());

    // result
}
