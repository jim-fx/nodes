use nodarium_macros::include_definition_file;
use nodarium_utils::{
    decode_float, encode_float, evaluate_int, set_panic_hook, split_args, wrap_arg,
};
use wasm_bindgen::prelude::*;
use web_sys::console;

include_definition_file!("src/input.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {

    set_panic_hook();

    let args = split_args(input);

    let size = evaluate_int(args[0]);
    let decoded = decode_float(size);
    let negative_size = encode_float(-decoded);

    console::log_1(&format!("WASM(triangle): input: {:?} -> {}", args[0],decoded).into());

    // [[1,3, x, y, z, x, y,z,x,y,z]];
    wrap_arg(&[
        1,          // 1: geometry
        3,          // 3 vertices
        1,          // 1 face
        // this are the indeces for the face
        0, 2, 1,
        //
        negative_size,  // x -> point 1
        0,              // y
        0,              // z
        //
        size,       // x -> point 2
        0,          // y
        0,          // z
        //
        0,          // x -> point 3
        0,          // y
        size,       // z
        // this is the normal for the single face 1065353216 == 1.0f encoded is i32
        0, 1065353216, 0,
        0, 1065353216, 0,
        0, 1065353216, 0,
    ])

}
