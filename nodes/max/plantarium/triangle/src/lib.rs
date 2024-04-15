use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    r#"{
        "min": { "type": "float", "value": 2 },
        "max": { "type": "float", "value": 2 },
        "seed": { "type": "seed" }
    }"#
    .to_string()
}

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    // construct vertices of a triangle
    // let min = evaluate_parameters(var_min);

    vec![1, 2, 3, 4, args[0]]
}
