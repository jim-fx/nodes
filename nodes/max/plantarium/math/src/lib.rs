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
pub fn execute(var_op_type: u8, var_a: JsValue, var_b: JsValue) -> String {
    utils::set_panic_hook();

    let a: String;
    let b: String;

    if var_a.is_string() {
        a = unwrap_string(var_a);
    } else {
        a = unwrap_float(var_a).to_string();
    }

    if var_b.is_string() {
        b = unwrap_string(var_b);
    } else {
        b = unwrap_float(var_b).to_string();
    }

    // Interpolate strings into JSON format
    let json_string = format!(
        r#"{{"parameter": "math", "op_type": {}, "a": {}, "b": {}}}"#,
        var_op_type, a, b
    );

    json_string
}
