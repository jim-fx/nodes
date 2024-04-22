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

    log!("output input: {:?}", input);

    let args = get_args(input);

    log!("output args: {:?}", args);

    let inputs = get_args(args[0]);
    let resolution = evaluate_int(args[1]) as usize;

    log!("inputs: {}, resolution: {}", inputs.len(), resolution);

    let mut output: Vec<Vec<i32>> = Vec::new();
    for arg in inputs {
        if arg.len() < 3 {
            continue;
        }

        let arg_type = arg[0];

        log!("arg: {:?}", arg);

        if arg_type == 0 {
            // this is stem
            let _arg = &arg[3..];
            let mut geometry = extrude_path(_arg, resolution);
            let matrix = Mat4::from_translation(Vec3::new(0.0, 0.0, 0.0));
            geometry = transform_geometry(geometry, matrix);
            output.push(geometry);
        } else if arg_type == 1 {
            // this is geometry
            output.push(arg.to_vec());
        }
    }

    concat_args(output)
}
