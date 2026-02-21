import * as vscode from 'vscode';

import type { QuickTranslateConfig } from '../types/internal-types';

export function getQuickTranslateConfig(): QuickTranslateConfig {
  const cfg = vscode.workspace.getConfiguration('quickTranslate');
  return {
    sourceLanguage: cfg.get<string>('sourceLanguage', 'auto').toLowerCase(),
    targetLanguage: cfg.get<string>('targetLanguage', 'vi').toLowerCase(),
    translateVersion: cfg.get<'v1' | 'v2'>('translateVersion', 'v1'),
    viewMode: cfg.get<'hover' | 'panel' | 'inline'>('viewMode', 'panel'),
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
    inlineSave: cfg.get<boolean>('inlineSave', false),
    maxLineCount: cfg.get<number>('maxLineCount', 50),
    largeSelectionThreshold: cfg.get<number>('largeSelectionThreshold', 1000),
    targetLanguages: cfg.get<string>('targetLanguages', '').trim(),
    historySize: cfg.get<number>('historySize', 20),
  };
}
