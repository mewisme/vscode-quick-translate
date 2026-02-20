import type { NormalizeOptions } from '../types/internal-types';

export function normalizeInput(text: string, opts: NormalizeOptions): string {
  if (!opts.normalizeText) { return text; }
  if (text.length < 3) {
    const trimmed = text.trim();
    if (opts.trimExtraSpaces) { return trimmed.replace(/\s{2,}/g, ' ').trim(); }
    return trimmed;
  }
  let s = text;
  if (opts.normalizeKebabCase) { s = s.replace(/-/g, ' '); }
  if (opts.normalizeSnakeCase) { s = s.replace(/_/g, ' '); }
  if (opts.normalizeDotCase) { s = s.replace(/\./g, ' '); }
  if (opts.normalizeMixedCase) { s = s.replace(/[-_.]+/g, ' '); }
  if (opts.normalizeCamelCase || opts.normalizePascalCase) {
    s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  if (opts.normalizeConsecutiveUppercase) {
    s = s.replace(/([A-Z]+)([A-Z]+[a-z])/g, '$1 $2');
  }
  if (opts.normalizeAcronyms) {
    s = s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  }
  if (opts.normalizeNumberBoundaries) {
    s = s.replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z])/g, '$1 $2');
  }
  if (opts.trimExtraSpaces) {
    s = s.replace(/\s{2,}/g, ' ').trim();
  }
  return s;
}
