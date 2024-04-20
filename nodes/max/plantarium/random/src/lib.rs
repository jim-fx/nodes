use macros::include_definition_file;
use wasm_bindgen::prelude::*;

include_definition_file!("src/definition.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    let mut result = Vec::with_capacity(args.len() + 7);
    result.push(0);
    result.push(1);
    result.push(0); // encoding the [ bracket
    result.push(args[1] + 1);

    result.push(1); // adding the node-type, random: 0
    result.extend_from_slice(&args[2..]);

    result.push(1);
    result.push(1); // closing bracket
    result.push(1);
    result.push(1); // closing bracket
    result
}
