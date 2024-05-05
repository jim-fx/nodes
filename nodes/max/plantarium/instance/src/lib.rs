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

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = split_args(input);
    let mut inputs = split_args(args[0]);
    log!("WASM(instance): inputs: {:?}", inputs);

    let mut geo_data = args[1].to_vec();
    let geo = wrap_geometry_data(&mut geo_data);

    let mut transforms: Vec<Mat4> = Vec::new();

    let mut max_depth = 0;
    for path_data in inputs.iter() {
        if path_data[2] != 0 {
            continue;
        }
        max_depth = max_depth.max(path_data[3]);
    }

    let depth = evaluate_int(args[5]);

    for path_data in inputs.iter() {
        if path_data[3] < (max_depth - depth + 1) {
            continue;
        }

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
                Vec3::new(point[3], point[3], point[3]),
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
