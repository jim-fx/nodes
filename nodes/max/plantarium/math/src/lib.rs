mod utils;

use plantarium::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
}

#[wasm_bindgen]
pub fn get_id() -> String {
    "math".to_string()
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    utils::set_panic_hook();
    r#"{
        "op_type": { "type": "select", "labels": ["add", "subtract", "multiply", "divide"], "internal": true, "value": 0 },
        "a": { "type": "float", "value": 2 },
        "b": { "type": "float", "value": 2 }
    }"#.to_string()
}

#[wasm_bindgen]
pub fn execute(var_op_type: JsValue, var_a: JsValue, var_b: JsValue) -> String {
    utils::set_panic_hook();

    utils::set_panic_hook();
    // Convert JsValues to strings
    let min_str = unwrap_string(var_min);
    let max_str = unwrap_string(var_max);
    let seed_str = unwrap_string(var_seed);

    // Interpolate strings into JSON format
    let json_string = format!(
        r#"{{"parameter": "random", "min": {}, "max": {}, "seed": {}}}"#,
        min_str, max_str, seed_str
    );

    json_string
}
