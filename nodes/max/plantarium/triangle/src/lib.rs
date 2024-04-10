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
        "min": { "type": "float", "value": 2 },
        "max": { "type": "float", "value": 2 },
        "seed": { "type": "seed" }
    }"#
    .to_string()
}

struct El {
    value: Option<f64>,
    array: Option<Vec<f64>>,
    nested: Option<Box<El>>,
}

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(var_min: JsValue, var_max: JsValue, var_seed: JsValue) -> Vec<f64> {
    utils::set_panic_hook();


    // construct vertices of a triangle
    let min= evaluate_parameters(var_min);

    return vec![
        0.0, 0.0, 0.0,
        min, 0.0, 0.0,
        min, min, 0.0
    ];
}
