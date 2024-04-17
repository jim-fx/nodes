use macros::include_definition_file;
use utils::{decode_float, evaluate_args, get_args, set_panic_hook, wrap_arg};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = get_args(input);

    let length = decode_float(evaluate_args(args[0])[0]);
    let thickness = decode_float(evaluate_args(args[1])[0]);
    let resolution = 64; //evaluate_args(args[2]);

    let mut path: Vec<i32> = vec![0; resolution * 4 + 1];
    path.resize(resolution * 4 + 1, 0);

    path[0] = 0;

    let slice = &mut path[1..];

    // Unsafe code to transmute the i32 slice to an f32 slice
    let path_p: &mut [f32] = unsafe {
        // Ensure that the length of the slice is a multiple of 4
        assert_eq!(slice.len() % 4, 0);

        // Transmute the i32 slice to an f32 slice
        std::slice::from_raw_parts_mut(slice.as_ptr() as *mut f32, slice.len())
    };

    for i in 0..resolution {
        let a = i as f32 / resolution as f32;
        path_p[i * 4] = (a * 8.0).sin() * 0.2;
        path_p[i * 4 + 1] = a * length;
        path_p[i * 4 + 2] = 0.0;
        path_p[i * 4 + 3] = thickness * (1.0 - a);
    }

    wrap_arg(&path)
}
