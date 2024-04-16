use macros::define_node;
use wasm_bindgen::prelude::*;

define_node!(
    r#"{
        "outputs": ["float"],
        "inputs": {
            "min": { "type": "float", "value": 2 },
            "max": { "type": "float", "value": 2 },
            "seed": { "type": "seed" }
        }
    }"#
);

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    // let min: String;
    // if var_min.is_string() {
    //     min = unwrap_string(var_min);
    // } else {
    //     min = unwrap_int(var_min).to_string();
    // }
    //
    // let max: String;
    // if var_max.is_string() {
    //     max = unwrap_string(var_max);
    // } else {
    //     max = unwrap_int(var_max).to_string();
    // }
    //
    // let seed: String;
    // if var_seed.is_string() {
    //     seed = unwrap_string(var_seed);
    // } else {
    //     seed = unwrap_int(var_seed).to_string();
    // }
    //
    // log(&format!("min: {}, max: {}, seed: {}", min, max, seed));
    //
    // // Interpolate strings into JSON format
    // let json_string = format!(
    //     r#"{{"__type": "random", "min": {}, "max": {}, "seed": {}}}"#,
    //     min, max, seed
    // );

    // json_string
    vec![1, args[0]]
}
