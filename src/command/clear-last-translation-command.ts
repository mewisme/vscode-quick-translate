import * as vscode from 'vscode';

import type { TranslationViewCoordinator } from '../view/renderer';

export function runClearLastTranslationCommand(
  coordinator: TranslationViewCoordinator
): () => void {
  return function clearLastTranslation(): void {
    coordinator.clearAll();
    vscode.window.showInformationMessage('Last translation cleared.');
  };
}
