#[no_mangle]
pub extern "C" fn execute(a: u32, b: u32) -> u32 {
    a + b
}

#[no_mangle]
pub extern "C" fn get_definition() -> String {
    include_str!("./node.json").to_string()
}
