import * as vscode from 'vscode';

import { translate } from './translator';

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand('quickTranslate.translateSelection', async () => {
    const cfg = vscode.workspace.getConfiguration('quickTranslate');
    const from = (cfg.get<string>('sourceLanguage') || 'auto').toLowerCase();
    const to = (cfg.get<string>('targetLanguage') || 'vi').toLowerCase();
    const modal = !!cfg.get<boolean>('modalPopup');

    const editor = vscode.window.activeTextEditor;
    const selected = editor?.document.getText(editor.selection) ?? '';
    const input = selected.trim() || (await vscode.window.showInputBox({
      prompt: 'Enter the text to translate',
      placeHolder: 'Type or paste text…'
    })) || '';

    if (!input.trim()) {
      vscode.window.showInformationMessage('No text to translate.');
      return;
    }

    const res = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Translating…', cancellable: false },
      async () => {
        try {
          return await translate(input, from, to);
        } catch (e: any) {
          return { error: true, text: e?.message || 'Unexpected error' };
        }
      }
    );

    if (res?.error) {
      vscode.window.showErrorMessage(res.text || 'Translation failed.');
      return;
    }

    const translated: string = res.text || '';
    const previewLimit = 4000;
    const preview = translated.length > previewLimit ? translated.slice(0, previewLimit) + '\n…(truncated)' : translated;

    await vscode.window.showInformationMessage(
      preview,
      { modal }
    );
  });

  context.subscriptions.push(cmd);
}

export function deactivate() { }
