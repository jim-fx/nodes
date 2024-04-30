use glam::Vec3;
use macros::include_definition_file;
use utils::{
    concat_args, evaluate_float, evaluate_int, geometry::wrap_path_mut, log, reset_call_count,
    set_panic_hook, split_args,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

fn lerp_vec3(a: Vec3, b: Vec3, t: f32) -> Vec3 {
    a + (b - a) * t
}

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    reset_call_count();

    let args = split_args(input);

    let plants = split_args(args[0]);
    let depth = evaluate_int(args[3]);

    let mut max_depth = 0;
    for path_data in plants.iter() {
        if path_data[2] != 0 {
            continue;
        }
        max_depth = max_depth.max(path_data[3]);
    }

    let output: Vec<Vec<i32>> = plants
        .iter()
        .map(|_path_data| {
            let mut path_data = _path_data.to_vec();
            if path_data[2] != 0 || path_data[3] < (max_depth - depth + 1) {
                return path_data;
            }

            let path = wrap_path_mut(&mut path_data);

            let mut offset_vec = Vec3::ZERO;

            for i in 1..path.length {
                // let alpha = i as f32 / (path.length - 1) as f32;
                let start_index = (i - 1) * 4;
                let end_index = start_index + 4;

                let start_point = Vec3::from_slice(&path.points[start_index..start_index + 3]);
                let end_point = Vec3::from_slice(&path.points[end_index..end_index + 3]);

                let length = (end_point - start_point).length();

                let normalised = (end_point - start_point).normalize();

                let strength = evaluate_float(args[1]);
                let down_point = Vec3::new(0.0, -length * strength, 0.0);

                let curviness = evaluate_float(args[2]);

                let mut mid_point = lerp_vec3(
                    normalised,
                    down_point,
                    curviness * (i as f32 / path.length as f32).sqrt(),
                );

                if mid_point[0] == 0.0 && mid_point[2] == 0.0 {
                    mid_point[0] += 0.0001;
                    mid_point[2] += 0.0001;
                }

                mid_point = mid_point.normalize();

                mid_point *= length;

                let final_end_point = start_point + mid_point;
                let offset_end_point = end_point + offset_vec;

                path.points[end_index] = offset_end_point[0];
                path.points[end_index + 1] = offset_end_point[1];
                path.points[end_index + 2] = offset_end_point[2];

                let offset = final_end_point - end_point;
                offset_vec += offset;
            }
            path_data
        })
        .collect();

    concat_args(output.iter().map(|x| x.as_slice()).collect())
}
