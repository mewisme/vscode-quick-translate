/**
 * Unit tests for html-extractor.ts.
 * No VS Code dependency — runs directly with tsx via `pnpm run test:unit`.
 */

import assert from 'node:assert';
import test from 'node:test';

import { extractByClass, extractByClasses } from '../../translator/html-extractor';

const SAMPLE_HTML = `
<html>
<body>
  <div class="header">Header text</div>
  <div class="result-container">Hello world</div>
  <div class="footer">Footer</div>
</body>
</html>`;

test('extractByClass – finds element by exact class', () => {
  const result = extractByClass(SAMPLE_HTML, 'result-container');
  assert.strictEqual(result, 'Hello world');
});

test('extractByClass – returns undefined when class not found', () => {
  const result = extractByClass(SAMPLE_HTML, 'nonexistent');
  assert.strictEqual(result, undefined);
});

test('extractByClass – does not match partial class names', () => {
  const result = extractByClass(SAMPLE_HTML, 'result');
  assert.strictEqual(result, undefined);
});

test('extractByClass – strips inner HTML tags from content', () => {
  const html = '<div class="result-container"><strong>Bold</strong> text</div>';
  const result = extractByClass(html, 'result-container');
  assert.strictEqual(result, 'Bold text');
});

test('extractByClass – handles multiple classes on element', () => {
  const html = '<div class="foo result-container bar">Content here</div>';
  const result = extractByClass(html, 'result-container');
  assert.strictEqual(result, 'Content here');
});

test('extractByClass – handles nested tags of same type', () => {
  const html = '<div class="result-container">outer<div>inner</div>end</div>';
  const result = extractByClass(html, 'result-container');
  assert.ok(result?.includes('outer'));
  assert.ok(result?.includes('end'));
});

test('extractByClasses – returns first match from candidate list', () => {
  const result = extractByClasses(SAMPLE_HTML, ['nonexistent', 'result-container', 'footer']);
  assert.strictEqual(result, 'Hello world');
});

test('extractByClasses – returns undefined when none match', () => {
  const result = extractByClasses(SAMPLE_HTML, ['nope', 'also-nope']);
  assert.strictEqual(result, undefined);
});

test('extractByClasses – skips empty string results', () => {
  const html = '<div class="empty"></div><div class="result-container">Found</div>';
  const result = extractByClasses(html, ['empty', 'result-container']);
  assert.strictEqual(result, 'Found');
});
