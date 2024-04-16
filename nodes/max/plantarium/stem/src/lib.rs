use macros::include_definition_file;
use utils::{evaluate_args, get_args};
use wasm_bindgen::prelude::*;
use web_sys::console;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    let args = get_args(input);

    let length = evaluate_args(args[0]);
    let thickness = evaluate_args(args[1]);
    let resolution = evaluate_args(args[2]);

    console::log_1(
        &format!(
            "length: {:?}, thickness: {:?}, resolution: {:?}",
            length, thickness, resolution
        )
        .into(),
    );

    let mut result: Vec<i32> = Vec::with_capacity(args.len() + 3);

    result.push(0); // encoding the [ bracket
    result.push(2);
    result.push(0); // adding the node-type, math: 0
    result.extend_from_slice(&thickness);
    result.push(1);
    result.push(1); // closing bracket

    result
}
