import { test, expect } from "vitest"
import { encodeFloat, decodeFloat } from "./encode"

test("encode_float", () => {
  const input = 1.23;
  const encoded = encodeFloat(input)
  const output = decodeFloat(encoded[0], encoded[1])
  console.log(input, output)
  expect(output).toBeCloseTo(input);
});

test("encode 2.0", () => {
  const input = 2.0;
  const encoded = encodeFloat(input)
  expect(encoded).toEqual([0, 128])
});

test("floating point imprecision", () => {
  let maxError = 0;
  new Array(10_000).fill(null).forEach((_, i) => {
    const input = i < 5_000 ? i : Math.random() * 100;
    const encoded = encodeFloat(input);
    const output = decodeFloat(encoded[0], encoded[1]);

    const error = Math.abs(input - output);
    if (error > maxError) {
      maxError = error;
    }
  });

  expect(maxError).toBeLessThan(0.00001);
});

// Test with negative numbers
test("negative numbers", () => {
  const inputs = [-1, -0.5, -123.456, -0.0001];
  inputs.forEach(input => {
    const encoded = encodeFloat(input);
    const output = decodeFloat(encoded[0], encoded[1]);
    expect(output).toBeCloseTo(input);
  });
});

// Test with very small numbers
test("very small numbers", () => {
  const input = 1.2345e-38;
  const encoded = encodeFloat(input)
  const output = decodeFloat(encoded[0], encoded[1])
  expect(output).toBeCloseTo(input);
});

// Test with zero
test("zero", () => {
  const input = 0;
  const encoded = encodeFloat(input)
  const output = decodeFloat(encoded[0], encoded[1])
  expect(output).toBe(0);
});

// Test with infinity
test("infinity", () => {
  const input = Infinity;
  const encoded = encodeFloat(input)
  const output = decodeFloat(encoded[0], encoded[1])
  expect(output).toBe(Infinity);
});

// Test with large numbers
test("large numbers", () => {
  const inputs = [1e+5, 1e+10];
  inputs.forEach(input => {
    const encoded = encodeFloat(input);
    const output = decodeFloat(encoded[0], encoded[1]);
    // Note: Large numbers may lose precision, hence using toBeCloseTo with a tolerance
    expect(output).toBeCloseTo(input, 0);
  });
});
