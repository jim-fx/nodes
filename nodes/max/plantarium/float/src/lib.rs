use macros::generate_input_types_file;
use utils::generate_outputs;
use wasm_bindgen::prelude::*;

generate_outputs!(["float"]);
generate_input_types_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    args.into()
}
