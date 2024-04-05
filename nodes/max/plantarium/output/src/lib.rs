mod utils;
use plantarium::evaluate_parameters;
use wasm_bindgen::prelude::*;

// lifted from the `console_log` example
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec![]
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    utils::set_panic_hook();
    r#"{
      "input": { "type": "float", "value": 0.0, "external": true }
    }"#
    .to_string()
}
#[wasm_bindgen]
pub fn execute(var_value: JsValue) -> f64 {
    utils::set_panic_hook();

    let res = evaluate_parameters(var_value);

    return res;
}
