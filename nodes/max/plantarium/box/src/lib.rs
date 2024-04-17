use crate::geometry::calculate_normals;
use macros::include_definition_file;
use utils::{
    decode_float, encode_float, evaluate_args, geometry, get_args, set_panic_hook, wrap_arg,
};
use wasm_bindgen::prelude::*;
use web_sys::console;

include_definition_file!("src/input.json");

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {

    set_panic_hook();

    let args = get_args(input);

    console::log_1(&format!("WASM(cube): input: {:?} -> {:?}", input, args ).into());

    let arg1 = evaluate_args(args[0]);

    let decoded = decode_float(arg1[0]);

    let p = encode_float(decoded);
    let n = encode_float(-decoded);


    // [[1,3, x, y, z, x, y,z,x,y,z]];
    let mut cube_geometry = [

        1,          // 1: geometry
        8,          // 8 vertices
        12,         // 12 faces
        
        /*
        Indeces:
        5----6
        | 4--+-7
        0-|--1 |
          3----2

        */
        // this are the indeces for the face
        0, 1, 2, 
        0, 2, 3, 
        0, 3, 4, 
        4, 5, 0, 
        6, 1, 0, 
        5, 6, 0, 
        7, 2, 1, 
        6, 7, 1, 
        2, 7, 3, 
        3, 7, 4, 
        7, 6, 4, 
        4, 6, 5,
        
        // Bottom plate
        p, n, n,
        p, n, p,
        n, n, p,
        n, n, n,

        // Top Plate
        n, p, n,
        p, p, n,
        p, p, p,
        n, p, p,

        // this is the normal for every single vert 1065353216 == 1.0f encoded is i32
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,

    ];

    
    calculate_normals(&mut cube_geometry);

    wrap_arg(&cube_geometry)

}
