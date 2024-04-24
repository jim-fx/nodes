use macros::include_definition_file;
use utils::{
    concat_args, evaluate_int,
    geometry::{extrude_path, wrap_path},
    get_args, log,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/inputs.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    let args = get_args(input);

    let inputs = get_args(args[0]);

    let resolution = evaluate_int(args[1]) as usize;

    log!("output inputs: {:?}", inputs);
    log!("inputs: {}, resolution: {}", inputs.len(), resolution);

    let mut output: Vec<Vec<i32>> = Vec::new();
    for arg in inputs {
        let arg_type = arg[2];
        log!("arg_type: {}, \n {:?}", arg_type, arg,);

        if arg_type == 0 {
            // this is path
            let mut vec = arg.to_vec();
            output.push(vec.clone());
            let path_data = wrap_path(&mut vec);
            log!("{:?}", path_data);
            let geometry = extrude_path(path_data, resolution);
            output.push(geometry);
        } else if arg_type == 1 {
            // this is geometry
            output.push(arg.to_vec());
        }
    }

    concat_args(output.iter().map(|v| v.as_slice()).collect())
}
