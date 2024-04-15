use std::cell::RefCell;

use serde_json::Value;
use wasm_bindgen::prelude::*;

pub fn unwrap_int(val: JsValue) -> i32 {
    if val.is_undefined() || val.is_null() {
        panic!("Value is undefined");
    }
    return val.as_f64().unwrap() as i32;
}

pub fn unwrap_float(val: JsValue) -> f64 {
    if val.is_undefined() || val.is_null() {
        panic!("Value is undefined");
    }
    return val.as_f64().unwrap();
}

pub fn unwrap_string(val: JsValue) -> String {
    if val.is_undefined() || val.is_null() {
        panic!("Value is undefined");
    }
    return val.as_string().unwrap();
}

pub fn evaluate_parameters(val: JsValue) -> f64 {
    let str = unwrap_string(val);
    let v: Value = serde_json::from_str(&str).unwrap();
    let index = RefCell::new(0.0);
    return walk_json(&v, &index);
}

fn walk_json(value: &Value, depth: &RefCell<f64>) -> f64 {
    *depth.borrow_mut() += 1.0;
    match value {
        // If it's an object, recursively walk through its fields
        Value::Object(obj) => {
            let obj_type = obj.get("__type").unwrap();
            if obj_type == "random" {
                let min = walk_json(obj.get("min").unwrap(), depth);
                let max = walk_json(obj.get("max").unwrap(), depth);
                let seed = (obj.get("seed").unwrap().as_f64().unwrap() + *depth.borrow() * 2000.0)
                    / 1000000.0;
                let range = max - min;
                let seed = seed % range;
                return seed - min;
            } else if obj_type == "math" {
                let a = walk_json(obj.get("a").unwrap(), depth);
                let b = walk_json(obj.get("b").unwrap(), depth);
                let op_type = obj.get("op_type").unwrap();
                if op_type == 0 {
                    return a + b;
                } else if op_type == 1 {
                    return a - b;
                } else if op_type == 2 {
                    return a * b;
                } else if op_type == 3 {
                    return a / b;
                }
            }
            return 0.0;
        }
        Value::Array(arr) => {
            for val in arr {
                walk_json(val, depth);
            }
            return 0.0;
        }
        Value::Number(num) => {
            return num.as_f64().unwrap();
        }
        // If it's a primitive value, print it
        _ => {
            return 0.0;
        }
    }
}
