use macros::include_definition_file;
use utils::{decode_float, encode_float};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    let mut sum = 0.0;

    // console::log_1(&format!("WASM(sum_node): args: {:?}", input).into());

    let length = (input.len() - 2) / 2;

    (0..length).for_each(|i| {
        // console::log_1(&format!("WASM(sum_node): i: {} sum: {:?}", i, sum).into());
        sum += decode_float(input[2 + i * 2]);
    });

    let encoded_sum = encode_float(sum);

    // console::log_1(&format!("WASM(sum_node): result: {:?}", sum).into());

    vec![0, 2, encoded_sum]
}
