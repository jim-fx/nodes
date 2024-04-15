use macros::generate_input_types_file;
use utils::{evaluate_args, generate_outputs, get_args};
use wasm_bindgen::prelude::*;
// use web_sys::console;

generate_outputs!(["float"]);

generate_input_types_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    let args = get_args(input);

    let value_encoded = evaluate_args(args[0]);
    // let value = decode_float(value_encoded[0], value_encoded[1]);
    let length = args[1];

    // console::log_1(&format!("WASM(array_node): args {:?} ", args).into());
    // console::log_1(&format!("WASM(array_node): value: {:?} length: {:?}", value, length).into());

    // construct array of length
    let mut res: Vec<i32> = Vec::with_capacity(length[0] as usize * 2 + 2);
    res.push(0);
    res.push((length[0]) * 2 + 2);
    for _ in 0..length[0] as usize {
        res.push(value_encoded[0]);
        res.push(value_encoded[1])
    }

    res
}
