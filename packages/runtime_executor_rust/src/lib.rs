pub struct NodeRegistryCore {
    storage_path: String,
}

impl NodeRegistryCore {
    pub fn new(storage_path: &str) -> NodeRegistryCore {
        NodeRegistryCore {
            storage_path: storage_path.to_string()
        }
    }

    // Function that takes a string and returns bytes
    pub fn string_to_bytes(&self, input: &str) -> Vec<u8> {
        // Combine the initialization argument and input string into bytes
        let result: Vec<u8> = format!("{} {}", self.storage_path, input).into_bytes();
        result
    }
}
