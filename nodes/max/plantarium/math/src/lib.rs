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
pub fn execute(var_op_type: JsValue, var_a: JsValue, var_b: JsValue) -> f64 {
    utils::set_panic_hook();

    let op_type = unwrap_int(var_op_type);
    let a = unwrap_float(var_a);
    let b = unwrap_float(var_b);

    match op_type {
        1 => return a - b,
        2 => return a * b,
        3 => return a / b,
        _ => return a + b,
    }
}
