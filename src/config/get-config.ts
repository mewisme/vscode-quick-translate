import * as vscode from 'vscode';

import type { QuickTranslateConfig } from '../types/internal-types';

export function getQuickTranslateConfig(): QuickTranslateConfig {
  const cfg = vscode.workspace.getConfiguration('quickTranslate');
  const version = cfg.get<string>('translateVersion') ?? 'v2';
  const translateVersion = version === 'v2' ? 'v2' : 'v1';
  const rawViewMode = cfg.get<string>('viewMode') ?? 'panel';
  const viewMode: 'hover' | 'panel' | 'inline' =
    rawViewMode === 'hover' ? 'hover' : rawViewMode === 'inline' ? 'inline' : 'panel';
  return {
    sourceLanguage: (cfg.get<string>('sourceLanguage') ?? 'auto').toLowerCase(),
    targetLanguage: (cfg.get<string>('targetLanguage') ?? 'vi').toLowerCase(),
    translateVersion,
    viewMode,
    normalizeText: cfg.get<boolean>('normalizeText', true),
    normalizeKebabCase: cfg.get<boolean>('normalizeKebabCase', true),
    normalizeSnakeCase: cfg.get<boolean>('normalizeSnakeCase', true),
    normalizeDotCase: cfg.get<boolean>('normalizeDotCase', true),
    normalizeMixedCase: cfg.get<boolean>('normalizeMixedCase', true),
    normalizeCamelCase: cfg.get<boolean>('normalizeCamelCase', true),
    normalizePascalCase: cfg.get<boolean>('normalizePascalCase', true),
    normalizeConsecutiveUppercase: cfg.get<boolean>('normalizeConsecutiveUppercase', true),
    normalizeAcronyms: cfg.get<boolean>('normalizeAcronyms', true),
    normalizeNumberBoundaries: cfg.get<boolean>('normalizeNumberBoundaries', true),
    trimExtraSpaces: cfg.get<boolean>('trimExtraSpaces', true),
  };
}
