import type { NormalizeOptions, QuickTranslateConfig } from '../types/internal-types';

export function getNormalizeOptions(config: QuickTranslateConfig): NormalizeOptions {
  return {
    normalizeText: config.normalizeText,
    normalizeKebabCase: config.normalizeKebabCase,
    normalizeSnakeCase: config.normalizeSnakeCase,
    normalizeDotCase: config.normalizeDotCase,
    normalizeMixedCase: config.normalizeMixedCase,
    normalizeCamelCase: config.normalizeCamelCase,
    normalizePascalCase: config.normalizePascalCase,
    normalizeConsecutiveUppercase: config.normalizeConsecutiveUppercase,
    normalizeAcronyms: config.normalizeAcronyms,
    normalizeNumberBoundaries: config.normalizeNumberBoundaries,
    trimExtraSpaces: config.trimExtraSpaces,
  };
}
