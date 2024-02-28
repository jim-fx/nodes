use wasmtime::{Config, Engine, component::Component, component::Instance};

use std::env;
use std::path::PathBuf;

fn get_current_working_dir() -> std::io::Result<PathBuf> {
    env::current_dir()
}

pub fn run_nodes() -> Result<i32, String> {

    let mut config = Config::new();
    config.wasm_multi_memory(true);
    config.wasm_component_model(true);

    // An engine stores and configures global compilation settings like
    // optimization level, enabled wasm features, etc.
    let engine = Engine::new(&config).expect("Could not create engine");


    let component = Component::from_file(&engine, "../../target/wasm32-unknown-unknown/release/add.wasm").expect("Could not load add.wasm");

    let resources = component.resources_required()
        .expect("this component does not import any core modules or instances");

    println!("{}", resources.num_memories);

    let instance = Instance::new(&engine, component);


    Ok(12)
}


fn main() {
    let _ = run_nodes();
}
