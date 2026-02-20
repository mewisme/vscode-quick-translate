import * as vscode from 'vscode';

import type { HoverStateController } from '../hover/hover-state';

export function runCopyLastTranslationCommand(
  hoverState: HoverStateController
): () => Promise<void> {
  return async function copyLastTranslation(): Promise<void> {
    const state = hoverState.getState();
    if (!state) {
      vscode.window.showInformationMessage('No translation to copy.');
      return;
    }
    await vscode.env.clipboard.writeText(state.text);
    vscode.window.showInformationMessage('Translation copied to clipboard.');
  };
}
