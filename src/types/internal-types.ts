export interface NormalizeOptions {
  normalizeText: boolean;
  normalizeKebabCase: boolean;
  normalizeSnakeCase: boolean;
  normalizeDotCase: boolean;
  normalizeMixedCase: boolean;
  normalizeCamelCase: boolean;
  normalizePascalCase: boolean;
  normalizeConsecutiveUppercase: boolean;
  normalizeAcronyms: boolean;
  normalizeNumberBoundaries: boolean;
  trimExtraSpaces: boolean;
}

export interface QuickTranslateConfig {
  sourceLanguage: string;
  targetLanguage: string;
  translateVersion: 'v1' | 'v2';
  viewMode: 'hover' | 'panel' | 'inline';
  normalizeText: boolean;
  normalizeKebabCase: boolean;
  normalizeSnakeCase: boolean;
  normalizeDotCase: boolean;
  normalizeMixedCase: boolean;
  normalizeCamelCase: boolean;
  normalizePascalCase: boolean;
  normalizeConsecutiveUppercase: boolean;
  normalizeAcronyms: boolean;
  normalizeNumberBoundaries: boolean;
  trimExtraSpaces: boolean;
  inlineSave: boolean;
  maxLineCount: number;
  largeSelectionThreshold: number;
  targetLanguages: string;
  historySize: number;
}

export interface HistoryEntry {
  sourceText: string;
  translatedText: string[];
  from: string;
  to: string;
  timestamp: Date;
}

export type TranslateBackendVersion = 'v1' | 'v2';

export interface TranslateSuccess {
  error: false;
  text: string[];
  fromLang?: string;
  toLang?: string;
  version: TranslateBackendVersion;
}

export interface TranslateError {
  error: true;
  text: string[];
}

export type TranslateResult = TranslateSuccess | TranslateError;

export function isTranslateSuccess(res: TranslateResult): res is TranslateSuccess {
  return res.error === false;
}
