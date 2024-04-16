use macros::include_definition_file;
use utils::evaluate_args;
use wasm_bindgen::prelude::*;

include_definition_file!("src/inputs.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    // console::log_1(&format!("WASM(output_node): input: {:?}", args).into());

    evaluate_args(args)
    // let decoded = decode_float(result[0], result[1]);

    // console::log_1(&format!("WASM: output: {:?}", decoded).into());

    // result
}
