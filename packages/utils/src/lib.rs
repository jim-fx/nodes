mod encoding;
mod helpers;
mod nodes;
mod tree;
pub use encoding::*;
pub use helpers::*;
pub use tree::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[macro_export]
macro_rules! generate_outputs {
    ([$($item:expr),* $(,)?]) => {
        #[wasm_bindgen]
        pub fn get_outputs() -> Vec<String> {
            vec![$($item.to_string()),*]
        }
    };
}
