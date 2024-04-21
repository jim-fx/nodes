use serde::{Deserialize, Deserializer, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
#[allow(non_camel_case_types)]
pub enum InputTypes {
    float(NodeInputFloat),
    integer(NodeInputInteger),
    boolean(NodeInputBoolean),
    select(NodeInputSelect),
    seed(NodeInputSeed),
    model(NodeInputModel),
    plant(NodeInputPlant),
    vec3(NodeInputVec3),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputVec3 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<Vec<f64>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputFloat {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub step: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputInteger {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max: Option<i64>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputBoolean {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputSelect {
    pub options: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputSeed {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<usize>,
}

// Assuming similar structure as other NodeInput types for Model and Plant
#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputModel {
    // Model-specific fields can be added here
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInputPlant {
    // Plant-specific fields can be added here
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DefaultOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub internal: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub external: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub setting: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<serde_json::Value>, // To handle both String and false
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum NodeDefinitionOrArray {
    Single(InputTypes),
    Multiple(Vec<String>),
}

#[derive(Debug, Serialize)]
pub struct NodeInput {
    pub types: Vec<String>,
    pub options: DefaultOptions,
}

impl<'de> Deserialize<'de> for NodeInput {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let raw_input: Value = Deserialize::deserialize(deserializer)?;
        let options: DefaultOptions =
            DefaultOptions::deserialize(&raw_input).map_err(serde::de::Error::custom)?; // Maps deserialization errors appropriately

        let types: Vec<String> = match raw_input.get("type") {
            Some(Value::String(single_type)) => vec![single_type.clone()],
            Some(Value::Array(types)) => types
                .iter()
                .map(|t| t.as_str().unwrap_or("").to_owned())
                .collect(),
            _ => return Err(serde::de::Error::custom("Invalid or missing 'type' field")),
        };

        Ok(NodeInput { types, options })
    }
}

#[derive(Deserialize, Debug, Serialize)]
pub struct NodeDefinition {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub inputs: Option<HashMap<String, NodeInput>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outputs: Option<Vec<String>>,
}
