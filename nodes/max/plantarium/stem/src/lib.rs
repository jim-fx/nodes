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
    let resolution = 32; //evaluate_args(args[2]);

    console::log_1(
        &format!(
            "length: {:?}, thickness: {:?}, resolution: {:?}",
            length, thickness, resolution
        )
        .into(),
    );

    vec![
        0, 1, 0,  // opening bracket
        11, // opening bracket
        0,  // type: plant
        0,  // alpha: 0
        0,  // x
        0,  // y
        0,  // z
        1,  // thickness
        0,  // x
        2,  // y
        0,  // z
        1,  // thickness
        1,  // closing bracket
        1,  //closing bracket
        1,  // closing bracket
        1,  //closing bracket
    ]
}
