import { expect, test } from 'vitest'
import { decode, encode } from './flat_tree'

// Original test case
test('it correctly decodes/encodes complex nested arrays', () => {
  const input = [5, [6, 1], 1, 5, [5], [7, 2, [5, 1]]];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with empty array
test('it correctly handles an empty array', () => {
  const input: number[] = [];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with nested empty arrays
test('it correctly handles nested empty arrays', () => {
  const input = [5, [], [6, []], []];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with single-element array
test('it correctly handles a single-element array', () => {
  const input = [42];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with deeply nested array
test('it correctly handles deeply nested arrays', () => {
  const input = [[[[[1]]]]];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with large numbers
test('it correctly handles large numbers', () => {
  const input = [2147483647, [-2147483648, 1234567890]];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with sequential nesting
test('it correctly handles sequential nesting', () => {
  const input = [1, [2, [3, [4, [5]]]]];
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});

// Test with mixed data types (if supported)
// Note: This test assumes your implementation supports mixed types. 
// If not, you can ignore or remove this test.
test('it correctly handles arrays with mixed data types', () => {
  const input = [1, 'text', [true, [null, ['another text']]]];
  // @ts-ignore
  const decoded = decode(encode(input));
  expect(decoded).toEqual(input);
});
