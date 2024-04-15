mod utils;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
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
pub fn execute(args: &[i32]) -> Vec<i32> {
    utils::set_panic_hook();

    args.into()
}
