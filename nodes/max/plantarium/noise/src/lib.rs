use glam::Vec3;
use macros::include_definition_file;
use noise::{core::open_simplex::open_simplex_2d, permutationtable::PermutationTable, Vector2};
use utils::{
    concat_args, decode_float, encode_float, evaluate_float, get_args, log, set_panic_hook,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

fn lerp(a: f32, b: f32, t: f32) -> f32 {
    a + t * (b - a)
}

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = get_args(input);

    let plants = get_args(args[0]);
    let scale = (evaluate_float(args[1]) * 0.1) as f64;
    let strength = evaluate_float(args[2]);
    let _fix_bottom = evaluate_float(args[3]);
    let fix_bottom = if _fix_bottom.is_finite() {
        _fix_bottom
    } else {
        0.0
    };

    let seed = args[4][0];

    let hasher = PermutationTable::new(seed as u32);
    log!(
        "scale: {}, strength: {}, fix_bottom: {}, seed: {}",
        scale,
        strength,
        fix_bottom,
        seed
    );

    let output: Vec<Vec<i32>> = plants
        .iter()
        .enumerate()
        .map(|(j, p)| {
            let mut plant = p.to_vec();

            log!("plant: {:?}", plant);

            let points = (plant.len() - 5) / 4;

            let p0 = Vec3::new(
                decode_float(plant[3]),
                decode_float(plant[4]),
                decode_float(plant[5]),
            );

            let p2 = Vec3::new(
                decode_float(plant[plant.len() - 6]),
                decode_float(plant[plant.len() - 5]),
                decode_float(plant[plant.len() - 4]),
            );
            // .... x, y, z, w, 1, 1
            //           -4 -3 -2 -1

            let length = (p2 - p0).length() as f64;

            log!("p0: {:?} p1: {:?} length: {}", p0, p2, length);

            for i in 0..points {
                let a = i as f64 / (points - 1) as f64;

                let px = Vector2::new(1000.0 + j as f64 + a * length * scale, a * scale as f64);
                let py = Vector2::new(2000.0 + j as f64 + a * length * scale, a * scale as f64);
                let pz = Vector2::new(3000.0 + j as f64 + a * length * scale, a * scale as f64);

                let nx = open_simplex_2d(px, &hasher) as f32
                    * strength
                    * 0.1
                    * lerp(1.0, a as f32, fix_bottom);

                let ny = open_simplex_2d(py, &hasher) as f32
                    * strength
                    * 0.1
                    * lerp(1.0, a as f32, fix_bottom);

                let nz = open_simplex_2d(pz, &hasher) as f32
                    * strength
                    * 0.1
                    * lerp(1.0, a as f32, fix_bottom);

                plant[3 + i * 4] = encode_float(decode_float(plant[3 + i * 4]) + nx);
                plant[4 + i * 4] = encode_float(decode_float(plant[4 + i * 4]) + ny);
                plant[5 + i * 4] = encode_float(decode_float(plant[5 + i * 4]) + nz);
            }

            plant
        })
        .collect();

    concat_args(output.iter().map(|v| v.as_slice()).collect())
}
