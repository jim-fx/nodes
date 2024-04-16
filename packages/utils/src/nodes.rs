use crate::encoding;

pub fn math_node(args: &[i32]) -> i32 {
    let math_type = args[0];

    let a = encoding::decode_float(args[1]);
    let b = encoding::decode_float(args[2]);

    let result = match math_type {
        0 => a + b,
        1 => a - b,
        2 => a * b,
        3 => a / b,
        _ => 0.0,
    };

    encoding::encode_float(result)
}
