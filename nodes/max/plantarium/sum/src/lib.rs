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
    r#"{
        "array": { "type": "float", "value": 2, "external": true }
    }"#
    .to_string()
}

#[rustfmt::skip]
#[wasm_bindgen]
pub fn execute(array: &[i32]) -> Vec<i32> {
    let mut sum = 0;
    array.iter().for_each(|x| sum += x);
    vec![1, sum]
}
