use glam::Vec3;
use macros::include_definition_file;
use noise::{core::open_simplex::open_simplex_2d, permutationtable::PermutationTable, Vector2};
use utils::{
    concat_args, evaluate_float, evaluate_int, evaluate_vec3, geometry::wrap_path_mut,
    reset_call_count, set_panic_hook, split_args,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

fn lerp(a: f32, b: f32, t: f32) -> f32 {
    a + t * (b - a)
}

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    reset_call_count();

    let args = split_args(input);

    let plants = split_args(args[0]);
    let scale = (evaluate_float(args[1]) * 0.1) as f64;
    let strength = evaluate_float(args[2]);
    let fix_bottom = evaluate_float(args[3]);

    let seed = args[4][0];

    let directional_strength = evaluate_vec3(args[5]);

    let depth = evaluate_int(args[6]);

    let hasher = PermutationTable::new(seed as u32);

    let mut max_depth = 0;
    for path_data in plants.iter() {
        if path_data[2] != 0 {
            continue;
        }
        max_depth = max_depth.max(path_data[3]);
    }

    let output: Vec<Vec<i32>> = plants
        .iter()
        .enumerate()
        .map(|(j, _path_data)| {
            let mut path_data = _path_data.to_vec();

            // if this is not a path don't modify it
            if path_data[2] != 0 {
                return path_data;
            }

            if path_data[3] < (max_depth - depth + 1) {
                return path_data;
            }

            let path = wrap_path_mut(&mut path_data);

            let p0 = Vec3::new(path.points[0], path.points[1], path.points[2]);

            let p2 = Vec3::new(
                path.points[path.length * 4 - 3],
                path.points[path.length * 4 - 2],
                path.points[path.length * 4 - 1],
            );

            let length = (p2 - p0).length() as f64;

            for i in 0..path.length {
                let a = i as f64 / (path.length - 1) as f64;

                let px = Vector2::new(1000.0 + j as f64 + a * length * scale, a * scale as f64);
                let py = Vector2::new(2000.0 + j as f64 + a * length * scale, a * scale as f64);
                let pz = Vector2::new(3000.0 + j as f64 + a * length * scale, a * scale as f64);

                let nx = open_simplex_2d(px, &hasher) as f32
                    * strength
                    * 0.1
                    * directional_strength[0]
                    * lerp(1.0, a as f32, fix_bottom);

                let ny = open_simplex_2d(py, &hasher) as f32
                    * strength
                    * 0.1
                    * directional_strength[1]
                    * lerp(1.0, a as f32, fix_bottom);

                let nz = open_simplex_2d(pz, &hasher) as f32
                    * strength
                    * 0.1
                    * directional_strength[2]
                    * lerp(1.0, a as f32, fix_bottom);

                path.points[i * 4] += nx;
                path.points[i * 4 + 1] += ny;
                path.points[i * 4 + 2] += nz;
            }
            path_data
        })
        .collect();

    concat_args(output.iter().map(|x| x.as_slice()).collect())
}
