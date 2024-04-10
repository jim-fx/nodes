mod utils;
use plantarium::{evaluate_parameters, unwrap_int, unwrap_string};
use wasm_bindgen::prelude::*;

// lifted from the `console_log` example
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    utils::set_panic_hook();
    r#"{
        "array": { "type": "float", "value": 2, "external": true }
    }"#
    .to_string()
}

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(array: &[f64]) -> f64 {
    utils::set_panic_hook();
    let mut sum = 0.0;
    array.iter().for_each(|x| sum += x);
    return sum;
}
