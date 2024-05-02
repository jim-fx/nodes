use glam::Vec3;
use nodarium_macros::include_definition_file;
use nodarium_utils::{
    concat_args, evaluate_float, evaluate_int,
    geometry::{wrap_path, wrap_path_mut},
    log, reset_call_count, set_panic_hook, split_args,
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
            let path_data = _path_data.to_vec();
            if path_data[2] != 0 || path_data[3] < (max_depth - depth + 1) {
                return path_data;
            }

            let path = wrap_path(&path_data);
            let mut output_data = path_data.clone();
            let output = wrap_path_mut(&mut output_data);

            let mut offset_vec = Vec3::ZERO;

            let original_length = path.get_length();

            for i in 0..path.length - 1 {
                let alpha = i as f32 / (path.length - 1) as f32;
                let start_index = i * 4;

                let start_point = Vec3::from_slice(&path.points[start_index..start_index + 3]);
                let end_point = Vec3::from_slice(&path.points[start_index + 4..start_index + 7]);

                let direction = end_point - start_point;

                let length = direction.length();

                let curviness = evaluate_float(args[2]);
                let strength =
                    evaluate_float(args[1]) / curviness.max(0.0001) * evaluate_float(args[1]);

                log!(
                    "length: {}, curviness: {}, strength: {}",
                    length,
                    curviness,
                    strength
                );

                let down_point = Vec3::new(0.0, -length * strength, 0.0);

                let mut mid_point = lerp_vec3(direction, down_point, curviness * alpha.sqrt());

                if mid_point[0] == 0.0 && mid_point[2] == 0.0 {
                    mid_point[0] += 0.0001;
                    mid_point[2] += 0.0001;
                }

                // Correct midpoint length
                mid_point *= mid_point.length() / length;

                let final_end_point = start_point + mid_point;
                let offset_end_point = end_point + offset_vec;

                output.points[start_index + 4] = offset_end_point[0];
                output.points[start_index + 5] = offset_end_point[1];
                output.points[start_index + 6] = offset_end_point[2];

                offset_vec += final_end_point - end_point;
            }
            log!("length: {} final: {}", original_length, output.get_length());
            output_data
        })
        .collect();

    concat_args(output.iter().map(|x| x.as_slice()).collect())
}
