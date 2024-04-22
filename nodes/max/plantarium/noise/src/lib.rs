use macros::include_definition_file;
use utils::{concat_args, get_args, log};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    let args = get_args(input);
    let plants = get_args(args[0]);
    log!("noise plants: {:?}", plants);
    concat_args(vec![plants[0].to_vec()])
}
