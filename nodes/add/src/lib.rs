mod bindings;

use bindings::Guest;

struct Component;

impl Guest for Component {
    /// Say hello!
    fn execute(left: i32, right: i32) -> i32 {
        left + right
    }
    fn get_definition() -> String {
        let definition = include_str!("./node.json");
        definition.to_string()
    }
}
