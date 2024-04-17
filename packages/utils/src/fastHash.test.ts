import { test, expect } from 'vitest';
import { fastHashArray, fastHashString } from './fastHash';

test('fastHashString doesnt produce clashes', () => {
  const hashA = fastHashString('abcdef');
  const hashB = fastHashString('abcdeg');
  const hashC = fastHashString('abcdeg');

  expect(hashA).not.toEqual(hashB);
  expect(hashB).toEqual(hashC);
});

test("fastHashArray doesnt product collisions", () => {

  const a = new Int32Array(1000);

  const hash_a = fastHashArray(a);
  a[0] = 1;

  const hash_b = fastHashArray(a);

  expect(hash_a).not.toEqual(hash_b);

});

test('fastHashArray is fast(ish) < 20ms', () => {

  const a = new Int32Array(10_000);

  const t0 = performance.now();
  fastHashArray(a);

  const t1 = performance.now();

  a[0] = 1;

  fastHashArray(a);

  const t2 = performance.now();

  expect(t1 - t0).toBeLessThan(20);
  expect(t2 - t1).toBeLessThan(20);
});

// test if the fastHashArray function is deterministic
test('fastHashArray is deterministic', () => {
  const a = new Int32Array(1000);
  a[42] = 69;
  const b = new Int32Array(1000);
  b[42] = 69;
  const hashA = fastHashArray(a);
  const hashB = fastHashArray(b);
  expect(hashA).toEqual(hashB);
});
