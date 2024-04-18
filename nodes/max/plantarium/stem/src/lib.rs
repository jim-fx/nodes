use macros::include_definition_file;
use utils::{evaluate_arg, evaluate_float, evaluate_vec3, get_args, set_panic_hook, wrap_arg};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = get_args(input);

    let origin = evaluate_vec3(args[0]);
    let length = evaluate_float(args[1]);
    let thickness = evaluate_float(args[2]);
    let res_curve = evaluate_arg(args[3]) as usize;

    let mut path: Vec<i32> = vec![0; res_curve * 4 + 1];
    path.resize(res_curve * 4 + 1, 0);

    let slice = &mut path[1..];

    // Unsafe code to transmute the i32 slice to an f32 slice
    let path_p: &mut [f32] = unsafe {
        // Ensure that the length of the slice is a multiple of 4
        assert_eq!(slice.len() % 4, 0);

        // Transmute the i32 slice to an f32 slice
        std::slice::from_raw_parts_mut(slice.as_ptr() as *mut f32, slice.len())
    };

    for i in 0..res_curve {
        let a = i as f32 / (res_curve - 1) as f32;
        path_p[i * 4] = origin[0] + (a * 8.0).sin() * 0.2;
        path_p[i * 4 + 1] = origin[1] + a * length;
        path_p[i * 4 + 2] = origin[2] + 0.0;
        path_p[i * 4 + 3] = thickness * (1.0 - a);
    }

    wrap_arg(&path)
}
