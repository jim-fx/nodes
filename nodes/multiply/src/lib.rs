use std::ffi::CString;
use std::os::raw::c_char;

#[no_mangle]
pub extern "C" fn execute(a: u32, b: u32) -> u32 {
    a + b
}

const DEFINITION: &str = include_str!("./node.json");

#[no_mangle]
pub fn get_definition() -> *mut c_char {
    let s = CString::new(DEFINITION).unwrap();
    s.into_raw()
}

#[no_mangle]
pub fn get_definition_len() -> usize {
    DEFINITION.len()
}
