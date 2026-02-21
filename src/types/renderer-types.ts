import type * as vscode from 'vscode';

import type { TranslateBackendVersion } from './internal-types';

export type ViewMode = 'hover' | 'panel' | 'inline';

export interface MultiTargetResult {
  to: string;
  text: string[];
}

export interface RenderContext {
  translatedText: string[];
  from: string;
  to: string;
  normalized: boolean;
  editor: vscode.TextEditor;
  selectionRange: vscode.Range;
  version?: TranslateBackendVersion;
  sourceWasAuto?: boolean;
  multiTarget?: MultiTargetResult[];
}

export interface TranslationRenderer {
  render(context: RenderContext): Promise<void>;
  clear?(): void;
  dispose?(): void;
}
