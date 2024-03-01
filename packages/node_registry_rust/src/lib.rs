use std::fs;
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
    ) -> Result<Vec<u8>, String> {
        let bytes = self.get_node(_author, _namespace, node_id);

        let engine = Engine::default();
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
