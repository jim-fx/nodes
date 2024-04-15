
export function encodeFloat(f: number): [number, number] {
  let buffer = new ArrayBuffer(4); // Create a buffer of 4 bytes (32 bits)
  let floatView = new Float32Array(buffer);
  let intView = new Uint32Array(buffer);

  floatView[0] = f; // Store the float into the buffer
  let bits = intView[0]; // Read the bits as integer

  let mantissa = bits & 0x007FFFFF;
  let exponent = (bits >> 23) & 0xFF;
  let sign = (f < 0.0) ? 1 : 0;

  // Include the sign bit in the mantissa
  mantissa = mantissa | (sign << 23);

  return [mantissa, exponent];
}

export function decodeFloat(mantissa: number, exponent: number): number {
  let signBit = (mantissa >> 23) & 1;
  let mantissaBits = mantissa & 0x007FFFFF;
  let exponentBits = (exponent & 0xFF) << 23;

  // Reconstruct all bits including sign
  let bits = (signBit << 31) | exponentBits | mantissaBits;

  let buffer = new ArrayBuffer(4);
  let floatView = new Float32Array(buffer);
  let intView = new Uint32Array(buffer);

  intView[0] = bits; // Set the bits as integer
  return floatView[0]; // Read the float back from the buffer
}
