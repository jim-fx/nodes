mod utils;
use plantarium::unwrap_float;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
}

#[wasm_bindgen]
pub fn get_id() -> String {
    "float".to_string()
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    utils::set_panic_hook();
    r#"{
      "value": { "type": "float", "value": 0.1, "internal": true }
    }"#
    .to_string()
}

#[wasm_bindgen]
pub fn execute(var_value: JsValue) -> f64 {
    utils::set_panic_hook();

    return unwrap_float(var_value);
}
