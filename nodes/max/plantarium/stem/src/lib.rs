use nodarium_macros::include_definition_file;
use nodarium_utils::{
    evaluate_float, evaluate_int, evaluate_vec3,
    geometry::{create_multiple_paths, wrap_multiple_paths},
    log, reset_call_count, set_panic_hook, split_args,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    reset_call_count();

    let args = split_args(input);

    let amount = evaluate_int(args[1]) as usize;
    let path_resolution = evaluate_int(args[4]) as usize;

    log!("stem args: {:?}", args);

    let mut stem_data = create_multiple_paths(amount, path_resolution, 1);

    let mut stems = wrap_multiple_paths(&mut stem_data);

    for stem in stems.iter_mut() {
        let origin = evaluate_vec3(args[0]);
        let length = evaluate_float(args[2]);
        let thickness = evaluate_float(args[3]);
        let amount_points = stem.points.len() / 4;

        for i in 0..amount_points {
            let a = i as f32 / (path_resolution - 1) as f32;
            stem.points[i * 4] = origin[0];
            stem.points[i * 4 + 1] = origin[1] + a * length;
            stem.points[i * 4 + 2] = origin[2];
            stem.points[i * 4 + 3] = thickness * (1.0 - a);
        }
    }

    log!("stem_data: {:?}", stem_data);

    stem_data
}
