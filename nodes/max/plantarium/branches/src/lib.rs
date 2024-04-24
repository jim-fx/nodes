use macros::include_definition_file;
use utils::{concat_args, decode_float, encode_float, get_args, set_panic_hook, wrap_arg};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {

    set_panic_hook();

    let args = get_args(input);

    let paths = get_args(args[0]);

    concat_args(paths)
}
