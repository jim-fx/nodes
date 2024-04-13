pub fn encode_float(f: f32) -> (i32, i32) {
    let bits = f.to_bits();
    let mantissa = (bits & 0x007FFFFF) as i32;
    let exponent = ((bits >> 23) & 0xFF) as i32;
    let sign = if f < 0.0 { 1 } else { 0 }; // Determine sign as 1 for negative, 0 for positive
    (mantissa | (sign << 23), exponent) // Include the sign bit in the mantissa
}

pub fn decode_float(mantissa: i32, exponent: i32) -> f32 {
    let sign_bit = ((mantissa >> 23) & 1) as u32; // Extract the sign bit
    let mantissa_bits = (mantissa & 0x007FFFFF) as u32;
    let exponent_bits = (exponent as u32 & 0xFF) << 23;
    let bits = (sign_bit << 31) | exponent_bits | mantissa_bits; // Reconstruct all bits including sign
    f32::from_bits(bits)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[rustfmt::skip]
    #[test]
    fn test_encode_decode() {
        let original_floats = [
            0.0, 1.0, -1.0, 123.456, -123.456, 1e-10, -1e10, f32::MAX, f32::MIN,
        ];
        for &original in &original_floats {
            let (mantissa, exponent) = encode_float(original);
            let decoded = decode_float(mantissa, exponent);
            assert!(
                (decoded - original).abs() < 1e-6,
                "Mismatch: original {} vs decoded {}",
                original,
                decoded
            );
        }
    }
}
