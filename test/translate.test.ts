/**
 * Tests for translate functions only (v1, v2).
 * Run: pnpm run test:translate
 * Requires network (hits Google Translate).
 */
import assert from 'node:assert';
import test from 'node:test';

import { translate, translateV2 } from '../src/translator';

const TIMEOUT_MS = 15_000;
const SAMPLE = 'hello';

test('translate (v1)', { timeout: TIMEOUT_MS }, async (t) => {
  await t.test('returns success with version v1 and expected shape', async () => {
    const res = await translate(SAMPLE, 'auto', 'vi');
    assert.strictEqual(res.error, false);
    if (res.error) {
      return;
    }
    assert.strictEqual(res.version, 'v1');
    assert(typeof res.text === 'string');
    assert(typeof res.fromLang === 'string');
    assert.strictEqual(res.toLang, 'vi');
  });

  await t.test('returns error for unsupported target language', async () => {
    const res = await translate(SAMPLE, 'auto', 'xx');
    assert.strictEqual(res.error, true);
    if (!res.error) {
      return;
    }
    assert(typeof res.text === 'string');
  });
});

test('translateV2', { timeout: TIMEOUT_MS }, async (t) => {
  await t.test('returns success with version v2 or v1 (fallback) and expected shape', async () => {
    const res = await translateV2(SAMPLE, 'auto', 'vi');
    assert.strictEqual(res.error, false);
    if (res.error) {
      return;
    }
    assert(['v1', 'v2'].includes(res.version));
    assert(typeof res.text === 'string');
    assert(typeof res.fromLang === 'string');
    assert.strictEqual(res.toLang, 'vi');
  });

  await t.test('returns error for unsupported target language', async () => {
    const res = await translateV2(SAMPLE, 'auto', 'xx');
    assert.strictEqual(res.error, true);
    if (!res.error) {
      return;
    }
    assert(typeof res.text === 'string');
  });
});
