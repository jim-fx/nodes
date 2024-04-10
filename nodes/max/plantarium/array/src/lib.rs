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
        "length": { "type": "float", "value": 2 }
    }"#
    .to_string()
}

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(var_length: i32) -> Vec<f64> {
    utils::set_panic_hook();


    let length = var_length;//evaluate_parameters(var_length);

    // construct array of length
    let mut res = Vec::new();
    for _ in 0..length as usize {
        res.push(2.0);
    }

    log("executing array");

    return res;

}
