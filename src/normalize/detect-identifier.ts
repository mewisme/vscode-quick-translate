export type IdentifierPattern = 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';

const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*$/;
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*[a-z][a-zA-Z0-9]*[A-Z]?[a-zA-Z0-9]*$|^[A-Z][a-z][a-zA-Z0-9]+$/;
const SNAKE_CASE = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;
const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;

/**
 * Detects whether a single-word (no whitespace) string looks like a known
 * identifier naming pattern. Returns the pattern name or null if none matched.
 *
 * Only fires on single tokens — multi-word input (containing spaces or
 * newlines) is not considered an identifier.
 */
export function detectIdentifierPattern(text: string): IdentifierPattern | null {
  const trimmed = text.trim();
  if (!trimmed || /\s/.test(trimmed) || trimmed.length < 3) {
    return null;
  }
  if (SNAKE_CASE.test(trimmed)) { return 'snake_case'; }
  if (KEBAB_CASE.test(trimmed)) { return 'kebab-case'; }
  if (CAMEL_CASE.test(trimmed)) { return 'camelCase'; }
  if (PASCAL_CASE.test(trimmed)) { return 'PascalCase'; }
  return null;
}
