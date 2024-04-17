use macros::include_definition_file;
use utils::{concat_args, decode_float, encode_float, get_args};
use wasm_bindgen::prelude::*;
use web_sys::console;

include_definition_file!("src/inputs.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    let args = get_args(input);

    console::log_1(&format!("WASM(output_node): input: {:?}", args).into());

    let mut output:Vec<&[i32]> = Vec::new();
    for arg in args {

        if arg.len() < 3 {
            continue;
        }

        output.push( match arg[2] {
            // stem
            0 => &[0,1,1,1],
            // geometry
            1 => arg,
            _ => &[0,1,1,1],
        })
    }

    concat_args(output)


}
