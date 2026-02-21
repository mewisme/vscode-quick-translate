/**
 * Unit tests for mapConcurrent.
 * No VS Code dependency — runs directly with tsx via `pnpm run test:unit`.
 */

import assert from 'node:assert';
import test from 'node:test';

import { mapConcurrent } from '../../utils/concurrency';

test('mapConcurrent – preserves result order', async () => {
  const results = await mapConcurrent([1, 2, 3, 4, 5], 2, async (n) => n * 2);
  assert.deepStrictEqual(results, [2, 4, 6, 8, 10]);
});

test('mapConcurrent – single item', async () => {
  const results = await mapConcurrent(['hello'], 3, async (s) => s.toUpperCase());
  assert.deepStrictEqual(results, ['HELLO']);
});

test('mapConcurrent – empty array', async () => {
  const results = await mapConcurrent([], 3, async (n: number) => n);
  assert.deepStrictEqual(results, []);
});

test('mapConcurrent – limit of 1 processes sequentially', async () => {
  const order: number[] = [];
  await mapConcurrent([1, 2, 3], 1, async (n) => {
    order.push(n);
    return n;
  });
  assert.deepStrictEqual(order, [1, 2, 3]);
});

test('mapConcurrent – limit >= items length behaves like Promise.all', async () => {
  const results = await mapConcurrent([10, 20, 30], 100, async (n) => n + 1);
  assert.deepStrictEqual(results, [11, 21, 31]);
});

test('mapConcurrent – limit < 1 throws RangeError', async () => {
  await assert.rejects(
    () => mapConcurrent([1, 2], 0, async (n) => n),
    RangeError
  );
});

test('mapConcurrent – passes index to fn', async () => {
  const indices: number[] = [];
  await mapConcurrent(['a', 'b', 'c'], 2, async (_, i) => {
    indices.push(i);
    return i;
  });
  assert.deepStrictEqual(indices.sort((a, b) => a - b), [0, 1, 2]);
});
