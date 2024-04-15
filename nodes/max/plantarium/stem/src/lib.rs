use macros::generate_input_types_file;
use utils::generate_outputs;
use wasm_bindgen::prelude::*;

generate_outputs!(["stem"]);

generate_input_types_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    let mut result = Vec::with_capacity(args.len() + 3);
    result.push(0); // encoding the [ bracket
    result.push(args[1] + 1);
    result.push(0); // adding the node-type, math: 0
    result.extend_from_slice(&args[2..]);
    result.push(1);
    result.push(1); // closing bracket

    result
}
