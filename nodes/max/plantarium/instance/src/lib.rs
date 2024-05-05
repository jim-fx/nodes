use glam::{Mat4, Quat, Vec3};
use nodarium_macros::include_definition_file;
use nodarium_utils::{
    concat_args, encode_float, evaluate_float, evaluate_int,
    geometry::{
        calculate_normals, create_instance_data, wrap_geometry_data, wrap_instance_data, wrap_path,
    },
    log, set_panic_hook, split_args, wrap_arg,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[rustfmt::skip]
fn create_geo() -> Vec<i32> {
    let size = 5.0;

    let p = encode_float(size);
    let n = encode_float(-size);

    // [[1,3, x, y, z, x, y,z,x,y,z]];
    wrap_arg(calculate_normals(&mut [
        1,  // 1: geometry
        8,  // 8 vertices
        12, // 12 faces
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
        4, 6, 5, // Bottom plate
        p, n, n, 
        p, n, p, 
        n, n, p, 
        n, n, n, // Top Plate
        n, p, n, 
        p, p, n, 
        p, p, p, 
        n, p, p, // this is the normal for every single vert 1065353216 == 1.0f encoded is i32
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0,
    ]))

}

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = split_args(input);
    let mut inputs = split_args(args[0]);
    log!("WASM(instance): inputs: {:?}", inputs);

    let mut geo_data = args[1].to_vec();
    let geo = wrap_geometry_data(&mut geo_data);

    let mut transforms: Vec<Mat4> = Vec::new();

    for path_data in inputs.iter() {
        let amount = evaluate_int(args[2]);

        let lowest_instance = evaluate_float(args[3]);
        let highest_instance = evaluate_float(args[4]);

        let path = wrap_path(path_data);

        for i in 0..amount {
            let alpha =
                lowest_instance + (i as f32 / amount as f32) * (highest_instance - lowest_instance);

            let point = path.get_point_at(alpha);
            let direction = path.get_direction_at(alpha);

            let transform = Mat4::from_scale_rotation_translation(
                Vec3::new(0.1, 0.1, 0.1),
                Quat::from_xyzw(direction[0], direction[1], direction[2], 1.0).normalize(),
                Vec3::from_slice(&point),
            );
            transforms.push(transform);
        }
    }

    let mut instance_data = create_instance_data(
        geo.positions.len() / 3,
        geo.faces.len() / 3,
        transforms.len(),
    );
    let mut instances = wrap_instance_data(&mut instance_data);
    instances.set_geometry(geo);
    (0..transforms.len()).for_each(|i| {
        instances.set_transformation_matrix(i, &transforms[i].to_cols_array());
    });

    log!("WASM(instance): geo: {:?}", instance_data);
    inputs.push(&instance_data);

    concat_args(inputs)
}
