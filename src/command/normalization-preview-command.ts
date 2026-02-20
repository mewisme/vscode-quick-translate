import * as vscode from 'vscode';

import { getQuickTranslateConfig } from '../config/get-config';
import { HOVER_RESET_DELAY_MS, type HoverStateController } from '../hover/hover-state';
import { getNormalizeOptions } from '../normalize/normalize-config';
import { normalizeInput } from '../normalize/normalize-input';

export function runNormalizationPreviewCommand(
  hoverState: HoverStateController
): () => Promise<void> {
  return async function normalizationPreview(): Promise<void> {
    const config = getQuickTranslateConfig();
    const opts = getNormalizeOptions(config);

    const editor = vscode.window.activeTextEditor;
    const selected = editor?.document.getText(editor.selection) ?? '';
    const input = selected.trim() || ((await vscode.window.showInputBox({
      prompt: 'Enter text to preview normalization',
      placeHolder: 'Type or paste text…',
    })) ?? '');

    if (!input.trim()) {
      vscode.window.showInformationMessage('No text to preview.');
      return;
    }

    const normalized = normalizeInput(input, opts);

    if (!editor?.document) { return; }

    const hadSelection = selected.trim().length > 0;
    const range = hadSelection
      ? editor.selection
      : new vscode.Range(editor.selection.active, editor.selection.active);

    hoverState.setState({
      text: [normalized],
      range,
      from: 'Normalized',
      to: 'Preview',
      docUri: editor.document.uri.toString(),
    });
    hoverState.setShouldShowHover(true);
    const versionAtShow = hoverState.getStateVersion();
    await vscode.commands.executeCommand('editor.action.showHover');
    setTimeout(() => {
      if (hoverState.getStateVersion() === versionAtShow) {
        hoverState.setShouldShowHover(false);
      }
    }, HOVER_RESET_DELAY_MS);
  };
}
