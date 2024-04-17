use macros::include_definition_file;
use utils::{concat_args, geometry::extrude_path, get_args};
use wasm_bindgen::prelude::*;

include_definition_file!("src/inputs.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: Vec<i32>) -> Vec<i32> {
    utils::set_panic_hook();

    let args = get_args(input.as_slice());

    let mut output:Vec<Vec<i32>> = Vec::new();
    for arg in args {

        if arg.len() < 3 { continue; }

        if arg[2] == 0 {
            let _arg = &arg[3..];
            let geometry = extrude_path(_arg, 8);
            output.push(geometry);
        }else if arg[2] == 1 {
            output.push(arg.to_vec());
        }

    }

    concat_args(output)

}
