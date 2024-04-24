use macros::include_definition_file;
use utils::{concat_args, set_panic_hook, split_args};
use wasm_bindgen::prelude::*;

include_definition_file!("src/definition.json");

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    set_panic_hook();
    let args = split_args(args);
    concat_args(vec![&[1], args[0], args[1], args[2]])
}
