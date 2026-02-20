import * as vscode from 'vscode';

export function runOpenSettingsCommand(): () => Promise<void> {
  return async function openSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'quickTranslate');
  };
}
