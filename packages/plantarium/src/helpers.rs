use wasm_bindgen::prelude::*;

pub fn unwrap_int(val: JsValue) -> u8 {
    if val.is_undefined() || val.is_null() {
        panic!("Value is undefined");
    }
    return val.as_f64().unwrap() as u8;
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

pub fn evaluate_parameter(val: JsValue) -> String {
    if val.is_undefined() || val.is_null() {
        panic!("Value is undefined");
    }
    return val.as_string().unwrap();
}
