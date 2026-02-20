import * as vscode from 'vscode';

import type { HoverStateController } from '../hover/hover-state';

export function runShowLastTranslationCommand(
  hoverState: HoverStateController
): () => Promise<void> {
  return async function showLastTranslation(): Promise<void> {
    if (!hoverState.getState()) {
      vscode.window.showInformationMessage('No translation to show.');
      return;
    }
    hoverState.setShouldShowHover(true);
    await vscode.commands.executeCommand('editor.action.showHover');
    setTimeout(() => { hoverState.setShouldShowHover(false); }, 0);
  };
}
