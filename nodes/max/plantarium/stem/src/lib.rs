use macros::include_definition_file;
use utils::{
    evaluate_float, evaluate_int, evaluate_vec3, get_args, log, reset_call_count, set_panic_hook,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    reset_call_count();

    let args = get_args(input);

    log!("stem args: {:?}", args);

    let amount = evaluate_int(args[1]) as usize;
    let res_curve = evaluate_int(args[4]) as usize;

    log!("STEM: amount: {}  res_curve: {}", amount, res_curve);

    // 4 extra for opening and closing brackets
    // and each stem has 5 extra for opening and closing brackets and node-type
    let output_size = 4 + amount * (res_curve * 4 + 5);

    let mut path: Vec<i32> = vec![0; output_size];
    path[0] = 0; // encode opening bracket
    path[1] = 1; // encode opening bracket
    path[output_size - 2] = 1; // encode closing bracket
    path[output_size - 1] = 1; // encode closing bracket

    for i in 0..amount {
        let start_index = 2 + i * (res_curve * 4 + 5);
        let end_index = 2 + (i + 1) * (res_curve * 4 + 5);

        let origin = evaluate_vec3(args[0]);
        let length = evaluate_float(args[2]);
        let thickness = evaluate_float(args[3]);

        log!(
            "STEM {i}: origin: {:?} length: {}  thickness: {}",
            origin,
            length,
            thickness
        );

        path[start_index] = 0; // encode opening bracket
        path[start_index + 1] = res_curve as i32 * 4 + 2; // encode opening bracket
        path[start_index + 2] = 0; // encode node-type, stem: 0

        path[end_index - 2] = 1; // encode closing bracket
        path[end_index - 1] = 1; // encode closing bracket

        let path_slice = &mut path[3 + start_index..end_index - 2];

        let path_p: &mut [f32] = unsafe {
            assert_eq!(path_slice.len() % 4, 0);
            std::slice::from_raw_parts_mut(path_slice.as_ptr() as *mut f32, path_slice.len())
        };

        for i in 0..res_curve {
            let a = i as f32 / (res_curve - 1) as f32;
            path_p[i * 4] = origin[0];
            path_p[i * 4 + 1] = origin[1] + a * length;
            path_p[i * 4 + 2] = origin[2];
            path_p[i * 4 + 3] = thickness * (1.0 - a);
        }
    }

    path
}
