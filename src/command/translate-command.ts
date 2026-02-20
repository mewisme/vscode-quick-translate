import * as vscode from 'vscode';

import { getQuickTranslateConfig } from '../config/get-config';
import type { HoverStateController } from '../hover/hover-state';
import { getNormalizeOptions } from '../normalize/normalize-config';
import { normalizeInput } from '../normalize/normalize-input';
import { translate } from '../translator';
import { isTranslateSuccess, type TranslateResult } from '../types/internal-types';

export function runTranslateCommand(
  hoverState: HoverStateController,
  options?: { skipNormalization?: boolean }
): () => Promise<void> {
  return async function translateSelection(): Promise<void> {
    const config = getQuickTranslateConfig();
    const from = config.sourceLanguage;
    const to = config.targetLanguage;

    const editor = vscode.window.activeTextEditor;
    const selected = editor?.document.getText(editor.selection) ?? '';
    const input = selected.trim() || ((await vscode.window.showInputBox({
      prompt: 'Enter the text to translate',
      placeHolder: 'Type or paste text…',
    })) ?? '');

    if (!input.trim()) {
      vscode.window.showInformationMessage('No text to translate.');
      return;
    }

    const textToTranslate =
      options?.skipNormalization === true
        ? input
        : (() => {
            const opts = getNormalizeOptions(config);
            return opts.normalizeText ? normalizeInput(input, opts) : input;
          })();

    let res: TranslateResult;
    try {
      const raw = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Window, title: 'Translating…', cancellable: false },
        () => translate(textToTranslate, from, to)
      );
      res = raw as TranslateResult;
    } catch (e: unknown) {
      res = { error: true, text: (e instanceof Error ? e.message : null) ?? 'Unexpected error' };
    }

    if (!isTranslateSuccess(res)) {
      vscode.window.showErrorMessage(res.text || 'Translation failed.');
      return;
    }

    const translated = res.text ?? '';
    const fromLang = res.fromLang ?? from;
    const toLang = res.toLang ?? to;

    if (!editor?.document) { return; }

    const hadSelection = selected.trim().length > 0;
    const range = hadSelection
      ? editor.selection
      : new vscode.Range(editor.selection.active, editor.selection.active);

    hoverState.setState({
      text: translated,
      range,
      from: fromLang,
      to: toLang,
      docUri: editor.document.uri.toString(),
      normalized: options?.skipNormalization !== true && config.normalizeText,
    });
    hoverState.setShouldShowHover(true);
    await vscode.commands.executeCommand('editor.action.showHover');
    setTimeout(() => { hoverState.setShouldShowHover(false); }, 0);
  };
}
