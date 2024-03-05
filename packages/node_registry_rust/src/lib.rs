use std::{
    ffi::{c_char, CStr},
    fs,
};
use wasmtime::*;

pub struct NodeRegistryCore {
    storage_path: String,
}

impl NodeRegistryCore {
    pub fn new(storage_path: &str) -> NodeRegistryCore {
        NodeRegistryCore {
            storage_path: storage_path.to_string(),
        }
    }

    pub fn get_node_definition(
        &self,
        _author: &str,
        _namespace: &str,
        node_id: &str,
    ) -> Result<String, String> {
        let bytes = self.get_node(_author, _namespace, node_id)?;

        let engine = Engine::default();
        let mut store = Store::new(&engine, ());
        let module = Module::new(&engine, bytes).map_err(|err| {
            println!("{}", err);
            err.to_string()
        })?;
        let instance = Instance::new(&mut store, &module, &[]).map_err(|_| "asd".to_string())?;

        let get_definition_len = instance
            .get_func(&mut store, "get_definition_len")
            .ok_or("Failed to find 'get_definition_len' function export")?;
        let get_definition_len_func = get_definition_len
            .typed::<(), i32>(&store)
            .map_err(|err| err.to_string())?;
        let len = get_definition_len_func
            .call(&mut store, ())
            .map_err(|err| err.to_string())?;

        // Access the exports
        let get_definition_ptr = instance
            .get_func(&mut store, "get_definition")
            .ok_or("Failed to find 'get_definition' function export")?;
        let get_definition_func = get_definition_ptr
            .typed::<(), i32>(&store)
            .map_err(|err| err.to_string())?;
        let ptr = get_definition_func
            .call(&mut store, ())
            .map_err(|err| err.to_string())?;

        println!("{} {}", ptr, len);

        Ok("Dude".to_string())
    }

    // Function that takes a string and returns bytes
    pub fn get_node(
        &self,
        _author: &str,
        _namespace: &str,
        node_id: &str,
    ) -> Result<Vec<u8>, String> {
        let res = fs::read_dir(&self.storage_path).map_err(|_| "Could not read dir")?;

        let file_names = res
            .filter_map(|entry| match entry {
                Ok(entry) => {
                    let file_type = entry.file_type().ok()?;
                    let file_path = entry.path();

                    // Skip directories
                    if file_type.is_dir() {
                        return None;
                    }

                    // Extract file name and extension
                    let file_name = entry.file_name().to_string_lossy().into_owned();
                    let extension = file_path.extension()?.to_string_lossy().into_owned();

                    if !file_name.starts_with(node_id) {
                        return None;
                    }

                    if extension != "wasm" {
                        return None;
                    }

                    Some(file_name)
                }
                Err(_) => None,
            })
            .collect::<Vec<String>>();

        if let Some(file_name) = file_names.get(0) {
            let bytes = fs::read(self.storage_path.clone() + "/" + file_name)
                .map_err(|_| "Could not read file".to_string())?;

            Ok(bytes)
        } else {
            Err("Not Found".into())
        }
    }
}
