use glam::{Mat4, Vec3};
use macros::include_definition_file;
use utils::{
    concat_args, evaluate_int,
    geometry::{extrude_path, transform_geometry},
    get_args, log,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/inputs.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    let args = get_args(input);

    log!("output args: {:?}", args);

    let inputs = get_args(args[0]);

    log!("output inputs: {:?}", inputs);

    let resolution = evaluate_int(args[1]) as usize;

    log!("inputs: {}, resolution: {}", inputs.len(), resolution);

    let mut output: Vec<Vec<i32>> = Vec::new();
    for arg in inputs {
        if arg.len() < 3 {
            continue;
        }

        let arg_type = arg[2];

        if arg_type == 0 {
            // this is stem
            let stem = &arg[2..arg.len() - 2];
            output.push(arg.to_vec());
            let geometry = extrude_path(stem, resolution);
            log!("geometry: {:?}", geometry);
            output.push(geometry);
        } else if arg_type == 1 {
            // this is geometry
            output.push(arg.to_vec());
        }
    }

    concat_args(output.iter().map(|v| v.as_slice()).collect())
}
