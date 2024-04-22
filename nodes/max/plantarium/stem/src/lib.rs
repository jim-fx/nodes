use macros::include_definition_file;
use utils::{evaluate_float, evaluate_int, evaluate_vec3, get_args, log, set_panic_hook, wrap_arg};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = get_args(input);

    log!("node-stem: {:?}", args);

    let origin = evaluate_vec3(args[0]);
    let length = evaluate_float(args[1]);
    let thickness = evaluate_float(args[2]);
    let res_curve = evaluate_int(args[3]) as usize;

    log!("origin: {:?}", origin);

    let amount_points = res_curve * 4;
    // +4 for opening and closing brackets and +1 node-type
    let output_size = amount_points + 5;

    let mut path: Vec<i32> = vec![0; output_size];
    path[0] = 0; // encode opening bracket
    path[1] = res_curve as i32 * 4 + 4; // encode opening bracket
    path[2] = 0; // encode node-type, stem: 0
    path[output_size - 2] = 1; // encode closing bracket
    path[output_size - 1] = 1; // encode closing bracket

    let slice = &mut path[3..output_size - 2];

    let path_p: &mut [f32] = unsafe {
        assert_eq!(slice.len() % 4, 0);
        std::slice::from_raw_parts_mut(slice.as_ptr() as *mut f32, slice.len())
    };

    for i in 0..res_curve {
        let a = i as f32 / (res_curve - 1) as f32;
        path_p[i * 4] = origin[0];
        path_p[i * 4 + 1] = origin[1] + a * length;
        path_p[i * 4 + 2] = origin[2];
        path_p[i * 4 + 3] = thickness * (1.0 - a);
    }

    log!("res: {:?}", path);

    path
}
