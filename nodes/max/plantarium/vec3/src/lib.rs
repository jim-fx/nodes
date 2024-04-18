use macros::include_definition_file;
use utils::log;
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    let mut result = Vec::with_capacity(args.len() + 2);
    result.push(0); // encoding the [ bracket
    result.push(args[1]);

    result.extend_from_slice(&args[2..]);

    result.push(1);
    result.push(1); // closing bracket

    log!("WASM(vec3): res {:?}", result);
    result
}
