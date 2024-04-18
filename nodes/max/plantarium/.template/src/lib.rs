use macros::include_definition_file;
use utils::{decode_float, encode_float, wrap_arg};
use wasm_bindgen::prelude::*;
use web_sys::console;

include_definition_file!("src/input.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    vec![]
}
