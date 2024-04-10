type SparseArray<T = number> = (T | T[] | SparseArray<T>)[];

// Encodes a nested array into a flat array with bracket and distance notation
export function encode(array: SparseArray): number[] {
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
        const child = encode(item);
        encoded.push(...child, 1, 0); // Note: The trailing comma after 0 can be removed
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

function decode_recursive(dense: number[], index = 0) {
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

export function decode(dense: number[]) {
  return decode_recursive(dense, 0)[0];
}
