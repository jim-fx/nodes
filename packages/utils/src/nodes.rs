use crate::{encoding, log};

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

static mut CALL_COUNT: i32 = 0;

pub fn random_node(args: &[i32]) -> i32 {
    let min = encoding::decode_float(args[0]);
    let max = encoding::decode_float(args[1]);
    let seed = (args[2] + unsafe { CALL_COUNT } * 2312312) % 100_000;
    let v = seed as f32 / 100_000.0;
    log!("Random node: min: {}, max: {}, seed: {}", min, max, seed);
    let result = min + v * (max - min);

    unsafe {
        CALL_COUNT += 1;
    }

    encoding::encode_float(result)
}
