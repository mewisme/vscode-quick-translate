/**
 * Unit tests for normalize-input.ts.
 * No VS Code dependency — runs directly with tsx via `pnpm run test:unit`.
 */

import assert from 'node:assert';
import test from 'node:test';

import { normalizeInput } from '../../normalize/normalize-input';
import type { NormalizeOptions } from '../../types/internal-types';

function opts(overrides: Partial<NormalizeOptions> = {}): NormalizeOptions {
  return {
    normalizeText: true,
    normalizeKebabCase: false,
    normalizeSnakeCase: false,
    normalizeDotCase: false,
    normalizeMixedCase: false,
    normalizeCamelCase: false,
    normalizePascalCase: false,
    normalizeConsecutiveUppercase: false,
    normalizeAcronyms: false,
    normalizeNumberBoundaries: false,
    trimExtraSpaces: false,
    ...overrides,
  };
}

test('normalizeInput – disabled when normalizeText is false', () => {
  const result = normalizeInput('helloWorld', opts({ normalizeText: false, normalizeCamelCase: true }));
  assert.strictEqual(result, 'helloWorld');
});

test('normalizeInput – short text (< 3 chars) is returned trimmed', () => {
  // 'a' has length 1, 'ab' has length 2 — both hit the early-return branch.
  assert.strictEqual(normalizeInput('a', opts()), 'a');
  assert.strictEqual(normalizeInput('ab', opts()), 'ab');
});

test('normalizeInput – normalizeKebabCase replaces hyphens with spaces', () => {
  const result = normalizeInput('hello-world-foo', opts({ normalizeKebabCase: true }));
  assert.strictEqual(result, 'hello world foo');
});

test('normalizeInput – normalizeSnakeCase replaces underscores with spaces', () => {
  const result = normalizeInput('hello_world_foo', opts({ normalizeSnakeCase: true }));
  assert.strictEqual(result, 'hello world foo');
});

test('normalizeInput – normalizeDotCase replaces dots with spaces', () => {
  const result = normalizeInput('hello.world.foo', opts({ normalizeDotCase: true }));
  assert.strictEqual(result, 'hello world foo');
});

test('normalizeInput – normalizeCamelCase splits at lowercase→uppercase boundary', () => {
  const result = normalizeInput('helloWorldFoo', opts({ normalizeCamelCase: true }));
  assert.strictEqual(result, 'hello World Foo');
});

test('normalizeInput – normalizePascalCase splits PascalCase', () => {
  const result = normalizeInput('HelloWorldFoo', opts({ normalizePascalCase: true }));
  assert.strictEqual(result, 'Hello World Foo');
});

test('normalizeInput – normalizeConsecutiveUppercase splits acronym runs', () => {
  const result = normalizeInput('XMLParser', opts({ normalizeConsecutiveUppercase: true }));
  assert.strictEqual(result, 'XML Parser');
});

test('normalizeInput – normalizeAcronyms splits acronym before capital+lower', () => {
  const result = normalizeInput('HTMLParser', opts({ normalizeAcronyms: true }));
  assert.strictEqual(result, 'HTML Parser');
});

test('normalizeInput – normalizeNumberBoundaries inserts spaces around digit transitions', () => {
  const result = normalizeInput('foo2Bar', opts({ normalizeNumberBoundaries: true }));
  assert.strictEqual(result, 'foo 2 Bar');
});

test('normalizeInput – trimExtraSpaces collapses whitespace and trims', () => {
  const result = normalizeInput('  hello   world  ', opts({ trimExtraSpaces: true }));
  assert.strictEqual(result, 'hello world');
});

test('normalizeInput – combined camelCase + trimExtraSpaces', () => {
  const result = normalizeInput('getHttpResponse', opts({ normalizeCamelCase: true, trimExtraSpaces: true }));
  assert.strictEqual(result, 'get Http Response');
});

test('normalizeInput – normalizeMixedCase replaces hyphens, underscores, and dots', () => {
  const result = normalizeInput('foo-bar_baz.qux', opts({ normalizeMixedCase: true }));
  assert.strictEqual(result, 'foo bar baz qux');
});

test('normalizeInput – snake_case + camelCase together', () => {
  const result = normalizeInput('my_camelCase_value', opts({
    normalizeSnakeCase: true,
    normalizeCamelCase: true,
    trimExtraSpaces: true,
  }));
  assert.strictEqual(result, 'my camel Case value');
});
