use macros::include_definition_file;
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    args.into()
}
