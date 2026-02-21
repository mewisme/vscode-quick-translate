import * as vscode from 'vscode';

import { getQuickTranslateConfig } from './config/get-config';

export function createTargetLanguageStatusBar(
  context: vscode.ExtensionContext
): vscode.Disposable {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  item.command = 'quickTranslate.openSettings';
  item.tooltip = 'Quick Translate: target language (click to open settings)';

  function refresh(): void {
    const { targetLanguage } = getQuickTranslateConfig();
    item.text = `$(globe) ${targetLanguage}`;
  }

  refresh();
  item.show();

  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('quickTranslate.targetLanguage')) {
      refresh();
    }
  });

  context.subscriptions.push(item, configListener);

  return new vscode.Disposable(() => {
    item.dispose();
    configListener.dispose();
  });
}
