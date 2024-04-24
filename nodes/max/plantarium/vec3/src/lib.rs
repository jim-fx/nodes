use macros::include_definition_file;
use utils::{concat_args, log, split_args};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    let args = split_args(input);
    log!("vec3 input: {:?}", input);
    log!("vec3 args: {:?}", args);
    concat_args(args)
}
