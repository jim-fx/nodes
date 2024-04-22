type SparseArray<T = number> = (T | T[] | SparseArray<T>)[];

export function concatEncodedArrays(input: (number | number[])[]): number[] {

  if (input.length === 1 && Array.isArray(input[0])) {
    return input[0]
  }

  const result = [0, 1]; // opening bracket

  let last_closing_bracket = 1;

  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    if (Array.isArray(item)) {
      result.push(...item);
      if (item.length > 2) {
        if (item[item.length - 2] !== 1 && item[item.length - 1] !== 1) {
          result.push(1, 1); // add closing bracket if missing
        }
      }
      last_closing_bracket = result.length - 1;
    } else {
      result[last_closing_bracket]++;
      result.push(item);
    }
  }

  result.push(1, 1); // closing bracket

  return result
}

// Encodes a nested array into a flat array with bracket and distance notation
export function encodeNestedArray(array: SparseArray): number[] {
  const encoded = [0, 0]; // Initialize encoded array with root bracket notation
  let missingBracketIndex = 1; // Track where to insert the distance to the next bracket

  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    if (Array.isArray(item)) {
      // Update the distance to the next bracket for the last opened bracket
      encoded[missingBracketIndex] = encoded.length - missingBracketIndex;
      if (item.length === 0) {
        // Handle empty arrays by directly adding bracket notation
        encoded.push(0, 1, 1, 1);
      } else {
        // Recursively encode non-empty arrays
        const child = encodeNestedArray(item);
        encoded.push(...child, 1, 0);
      }
      // Update missingBracketIndex to the position of the newly added bracket
      missingBracketIndex = encoded.length - 1;
    } else {
      // Handle non-array items
      encoded.push(item);
      // Update the distance for the last opened bracket
      if (missingBracketIndex) encoded[missingBracketIndex] = index + 2;
    }
  }
  return encoded;
};

function decode_recursive(dense: number[] | Int32Array, index = 0) {

  if (dense instanceof Int32Array) {
    dense = Array.from(dense)
  }

  const decoded: (number | number[])[] = [];
  let nextBracketIndex = dense[index + 1] + index + 1; // Calculate the index of the next bracket

  index += 2; // Skip the initial bracket notation
  while (index < dense.length) {
    if (index === nextBracketIndex) {
      if (dense[index] === 0) { // Opening bracket detected
        const [p, nextIndex, _nextBracketIndex] = decode_recursive(dense, index);
        decoded.push(p);
        index = nextIndex + 1;
        nextBracketIndex = _nextBracketIndex;
      } else { // Closing bracket detected
        nextBracketIndex = dense[index + 1] + index + 1;
        return [decoded, index, nextBracketIndex] as const;
      }
    } else if (index < nextBracketIndex) {
      decoded.push(dense[index]); // Add regular number to decoded array
    }
    index++;
  }
  return [decoded, index, nextBracketIndex] as const;
}

export function decodeNestedArray(dense: number[] | Int32Array) {
  return decode_recursive(dense, 0)[0];
}
