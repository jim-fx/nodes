use wasm_bindgen::prelude::*;
// use web_sys::console;

#[wasm_bindgen]
pub fn get_outputs() -> Vec<String> {
    vec!["float".to_string()]
}

#[wasm_bindgen]
pub fn get_input_types() -> String {
    r#"{
        "op_type": { "label": "type", "type": "select", "labels": ["add", "subtract", "multiply", "divide"], "internal": true, "value": 0 },
        "a": { "type": "float", "value": 2 },
        "b": { "type": "float", "value": 2 }
    }"#.to_string()
}

#[wasm_bindgen]
pub fn execute(args: &[i32]) -> Vec<i32> {
    // let d = args
    //     .iter()
    //     .map(|&num| num.to_string()) // Convert each integer to a String
    //     .collect::<Vec<String>>() // Collect all Strings into a Vec
    //     .join(","); // Join all Strings in the Vec with a dot
    // console::log_1(&format!("Math: {:?}", d).into());

    let mut result = Vec::with_capacity(args.len() + 3);
    result.push(0); // encoding the [ bracket
    result.push(args[1] + 1);
    result.push(0); // adding the node-type, math: 0
    result.extend_from_slice(&args[2..]);
    result.push(1);
    result.push(1); // closing bracket

    result
}
