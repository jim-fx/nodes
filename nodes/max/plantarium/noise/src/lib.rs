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
    let scale = evaluate_float(args[1]);
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
        .map(|p| {
            let mut plant = p.to_vec();

            log!("plant: {:?}", plant);

            let points = (plant.len() - 5) / 4;
            for i in 0..points {
                let a = i as f64 / (points - 1) as f64;
                let px = Vector2::new(0.0, a * scale as f64);
                let pz = Vector2::new(a * scale as f64, 0.0);
                let nx = open_simplex_2d(px, &hasher) as f32
                    * strength
                    * 0.1
                    * lerp(1.0, a as f32, fix_bottom);
                let nz = open_simplex_2d(pz, &hasher) as f32
                    * strength
                    * 0.1
                    * lerp(1.0, a as f32, fix_bottom);
                plant[3 + i * 4] = encode_float(decode_float(plant[3 + i * 4]) + nx);
                plant[5 + i * 4] = encode_float(decode_float(plant[5 + i * 4]) + nz);
            }

            plant
        })
        .collect();

    concat_args(output.iter().map(|v| v.as_slice()).collect())
}
