use macros::include_definition_file;
use utils::{evaluate_args, get_args};
use wasm_bindgen::prelude::*;
use web_sys::console;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    let args = get_args(input);

    let value_encoded = evaluate_args(args[0]);
    // let value = decode_float(value_encoded[0], value_encoded[1]);
    let length = (args[1][0]) as usize;

    console::log_1(&format!("WASM(array): input: {:?} -> {:?}", args, value_encoded).into());

    // construct array of length
    let mut res: Vec<i32> = Vec::with_capacity(length + 4);
    res.push(0);
    res.push(length as i32 + 4);
    for _ in 0..length {
        res.push(value_encoded[0]);
    }
    res.push(1);
    res.push(1);

    res
}
