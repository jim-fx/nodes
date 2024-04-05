mod utils;
use plantarium::unwrap_string;
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
pub fn get_id() -> String {
    "float".to_string()
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
pub fn execute(var_value: JsValue) -> String {
    utils::set_panic_hook();

    let str = unwrap_string(var_value);

    log(&format!("str: {}", str));

    return str;
}
