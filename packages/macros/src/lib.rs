extern crate proc_macro;
use nodarium_types::NodeDefinition;
use proc_macro::TokenStream;
use quote::quote;
use std::env;
use std::fs;
use std::path::Path;
use syn::parse_macro_input;

fn add_line_numbers(input: String) -> String {
    return input
        .split('\n')
        .enumerate()
        .map(|(i, line)| format!("{:2}: {}", i + 1, line))
        .collect::<Vec<String>>()
        .join("\n");
}

#[proc_macro_attribute]
pub fn nodarium_execute(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input_fn = parse_macro_input!(item as syn::ItemFn);
    let _fn_name = &input_fn.sig.ident;
    let _fn_vis = &input_fn.vis;
    let fn_body = &input_fn.block;

    let first_arg_ident = if let Some(syn::FnArg::Typed(pat_type)) = input_fn.sig.inputs.first() {
        if let syn::Pat::Ident(pat_ident) = &*pat_type.pat {
            &pat_ident.ident
        } else {
            panic!("Expected a simple identifier for the first argument");
        }
    } else {
        panic!("The execute function must have at least one argument (the input slice)");
    };

    // We create a wrapper that handles the C ABI and pointer math
    let expanded = quote! {
        extern "C" {
            fn host_log_panic(ptr: *const u8, len: usize);
            fn host_log(ptr: *const u8, len: usize);
        }

        fn setup_panic_hook() {
            static SET_HOOK: std::sync::Once = std::sync::Once::new();
            SET_HOOK.call_once(|| {
                std::panic::set_hook(Box::new(|info| {
                    let msg = info.to_string();
                    unsafe { host_log_panic(msg.as_ptr(), msg.len()); }
                }));
            });
        }
        
        #[no_mangle]
        pub extern "C" fn __alloc(len: usize) -> *mut i32 {
            let mut buf = Vec::with_capacity(len);
            let ptr = buf.as_mut_ptr();
            std::mem::forget(buf);
            ptr
        }

        #[no_mangle]
        pub extern "C" fn __free(ptr: *mut i32, len: usize) {
            unsafe {
                let _ = Vec::from_raw_parts(ptr, 0, len);
            }
        }

        static mut OUTPUT_BUFFER: Vec<i32> = Vec::new();

        #[no_mangle]
        pub extern "C" fn execute(ptr: *const i32, len: usize) -> *mut i32 {
            setup_panic_hook();
            // 1. Convert raw pointer to slice
            let input = unsafe { core::slice::from_raw_parts(ptr, len) };

            // 2. Call the logic (which we define below)
            let result_data: Vec<i32> = internal_logic(input);

            // 3. Use the static buffer for the result
            let result_len = result_data.len();
            unsafe {
                OUTPUT_BUFFER.clear();
                OUTPUT_BUFFER.reserve(result_len + 1);
                OUTPUT_BUFFER.push(result_len as i32);
                OUTPUT_BUFFER.extend(result_data);
                
                OUTPUT_BUFFER.as_mut_ptr()
            }
        }

        fn internal_logic(#first_arg_ident: &[i32]) -> Vec<i32> {
            #fn_body
        }
    };

    TokenStream::from(expanded)
}

#[proc_macro]
pub fn nodarium_definition_file(input: TokenStream) -> TokenStream {
    let path_lit = syn::parse_macro_input!(input as syn::LitStr);
    let file_path = path_lit.value();

    let project_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let full_path = Path::new(&project_dir).join(&file_path);

    let json_content = fs::read_to_string(&full_path).unwrap_or_else(|err| {
        panic!("Failed to read JSON file at '{}/{}': {}", project_dir, file_path, err)
    });

    let _: NodeDefinition = serde_json::from_str(&json_content).unwrap_or_else(|err| {
        panic!("JSON file contains invalid JSON: \n{} \n{}", err, add_line_numbers(json_content.clone()))
    });

    // We use the span from the input path literal
    let bytes = syn::LitByteStr::new(json_content.as_bytes(), path_lit.span());
    let len = json_content.len();

    let expanded = quote! {
        #[link_section = "nodarium_definition"]
        static DEFINITION_DATA: [u8; #len] = *#bytes;
        
        #[no_mangle]
        pub extern "C" fn get_definition_ptr() -> *const u8 {
            DEFINITION_DATA.as_ptr()
        }

        #[no_mangle]
        pub extern "C" fn get_definition_len() -> usize {
            DEFINITION_DATA.len()
        }
    };

    TokenStream::from(expanded)
}
