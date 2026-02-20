import * as vscode from 'vscode';

import type { HoverStateController } from '../hover/hover-state';

export function runClearLastTranslationCommand(
  hoverState: HoverStateController
): () => void {
  return function clearLastTranslation(): void {
    hoverState.reset();
    vscode.window.showInformationMessage('Last translation cleared.');
  };
}
