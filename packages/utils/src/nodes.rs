use crate::{encoding, log};
use noise::{core::open_simplex::open_simplex_2d, permutationtable::PermutationTable, Vector2};

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

pub fn reset_call_count() {
    unsafe {
        CALL_COUNT = 0;
    }
}

pub fn random_node(args: &[i32]) -> i32 {
    let min = encoding::decode_float(args[0]);
    let max = encoding::decode_float(args[1]);

    let seed = (args[2] + unsafe { CALL_COUNT }) % 100_000;
    let hasher = PermutationTable::new(seed as u32);

    let value = open_simplex_2d(Vector2::new(seed as f64, 5.0), &hasher) as f32 + 0.5;

    log!(
        "Random node: min: {}, max: {}, seed: {}, v: {}",
        min,
        max,
        seed,
        value
    );
    let result = min + value * (max - min);

    unsafe {
        CALL_COUNT = (CALL_COUNT + 512) % i32::MAX;
    }

    encoding::encode_float(result)
}
