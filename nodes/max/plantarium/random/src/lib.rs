mod utils;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
}

#[wasm_bindgen]
pub fn get_id() -> String {
    "random".to_string()
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    utils::set_panic_hook();
    r#"{
        "min": { "type": "float", "value": 2 },
        "max": { "type": "float", "value": 2 },
        "seed": { "type": "seed" }
    }"#
    .to_string()
}

#[wasm_bindgen]
pub fn execute(var_min: String, var_max: String, var_seed: i32) -> String {
    utils::set_panic_hook();

    // Interpolate strings into JSON format
    let json_string = format!(
        r#"{{"parameter": "random", "min": {}, "max": {}, "seed": {}}}"#,
        var_min, var_max, var_seed
    );

    json_string
}
