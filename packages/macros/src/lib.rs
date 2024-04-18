extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;
use std::env;
use std::fs;
use std::path::Path;
use syn::{parse_macro_input, LitStr};
use types::NodeType;

#[proc_macro]
pub fn define_node(input: TokenStream) -> TokenStream {
    let input_string = parse_macro_input!(input as LitStr).value();

    // Validate JSON format
    let json: NodeType = match serde_json::from_str(&input_string) {
        Ok(json) => json,
        Err(e) => panic!("Invalid JSON input: {}", e),
    };

    // Convert the validated JSON back to a pretty-printed string
    let formatted_json = serde_json::to_string_pretty(&json).expect("Failed to serialize JSON");

    // Generate the output function
    let expanded = quote! {
        #[wasm_bindgen]
        pub fn get_definition() -> String {
            String::from(#formatted_json)
        }
    };

    // Convert the generated code back to a TokenStream
    TokenStream::from(expanded)
}

#[proc_macro]
pub fn include_definition_file(input: TokenStream) -> TokenStream {
    let file_path = syn::parse_macro_input!(input as syn::LitStr).value();

    // Retrieve the directory containing the Cargo.toml file
    let project_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let full_path = Path::new(&project_dir).join(&file_path);

    // Read the JSON file content
    let json_content = fs::read_to_string(full_path).unwrap_or_else(|err| {
        panic!(
            "Failed to read JSON file at '{}/{}': {}",
            project_dir, file_path, err
        )
    });

    // Optionally, validate that the content is valid JSON
    let _: NodeType = serde_json::from_str(&json_content)
        .unwrap_or_else(|err| panic!("JSON file contains invalid JSON: {}", err));

    // Generate the function that returns the JSON string
    let expanded = quote! {
        #[wasm_bindgen]
        pub fn get_definition() -> String {
            String::from(#json_content)
        }
    };

    // Convert the generated code back to a TokenStream
    TokenStream::from(expanded)
}
