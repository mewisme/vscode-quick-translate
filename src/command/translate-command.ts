import * as vscode from 'vscode';

import { getQuickTranslateConfig } from '../config/get-config';
import { HOVER_RESET_DELAY_MS, type HoverStateController } from '../hover/hover-state';
import { getNormalizeOptions } from '../normalize/normalize-config';
import { normalizeInput } from '../normalize/normalize-input';
import { translate, translateV2 } from '../translator';
import {
  isTranslateSuccess,
  type TranslateBackendVersion,
  type TranslateResult,
} from '../types/internal-types';

const LINE_SPLIT = /\r?\n/;
const BLANK_LINE = /^\s*$/;

type LineOk = { ok: true; text: string; fromLang?: string; version?: TranslateBackendVersion };
type LineErr = { ok: false; error: string };
type LineResult = LineOk | LineErr;

type TranslateApiSuccess = {
  error: false;
  text: string;
  fromLang?: string;
  toLang?: string;
  version: TranslateBackendVersion;
};
type TranslateApiResult = TranslateApiSuccess | { error: true; text: string };

function toLineResult(r: TranslateApiResult): LineResult {
  if (r.error === false) {
    return {
      ok: true,
      text: r.text ?? '',
      fromLang: r.fromLang,
      version: r.version,
    };
  }
  return { ok: false, error: r.text };
}

function getTranslateFn(version: 'v1' | 'v2') {
  return version === 'v2' ? translateV2 : translate;
}

export function runTranslateCommand(
  hoverState: HoverStateController,
  options?: { skipNormalization?: boolean }
): () => Promise<void> {
  return async function translateSelection(): Promise<void> {
    const config = getQuickTranslateConfig();
    const from = config.sourceLanguage;
    const to = config.targetLanguage;
    const doTranslate = getTranslateFn(config.translateVersion);

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

    const rawLines = input.split(LINE_SPLIT);
    const skipNorm = options?.skipNormalization === true;
    const normOpts = skipNorm ? undefined : getNormalizeOptions(config);
    const lines: string[] =
      !normOpts || !normOpts.normalizeText
        ? rawLines
        : rawLines.map((line) => normalizeInput(line, normOpts));
    const textToTranslate = lines.join('\n');
    const hasLineBreaks = lines.length > 1;

    let res: TranslateResult;
    try {
      if (!hasLineBreaks) {
        const raw = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Window, title: 'Translating…', cancellable: false },
          () => doTranslate(textToTranslate, from, to)
        );
        res = raw.error === false
          ? {
              error: false,
              text: [raw.text],
              fromLang: raw.fromLang ?? from,
              toLang: raw.toLang ?? to,
              version: raw.version,
            }
          : { error: true, text: [raw.text] };
      } else {
        const linePromises = lines.map((line) =>
          BLANK_LINE.test(line)
            ? Promise.resolve({ ok: true as const, text: '' })
            : doTranslate(line, from, to).then(toLineResult)
        );
        const textArray: LineResult[] = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Window, title: 'Translating…', cancellable: false },
          () => Promise.all(linePromises)
        );
        const firstFailure = textArray.find((x): x is LineErr => !x.ok);
        if (firstFailure) {
          res = { error: true, text: [firstFailure.error] };
        } else {
          const okLines = textArray as LineOk[];
          const firstWithLang = okLines.find((x) => x.ok && x.fromLang !== undefined);
          const firstWithVersion = okLines.find((x) => x.ok && x.version !== undefined);
          res = {
            error: false,
            text: okLines.map((x) => x.text),
            fromLang: firstWithLang?.fromLang ?? from,
            toLang: to,
            version: firstWithVersion?.version ?? config.translateVersion,
          };
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      res = { error: true, text: [msg] };
    }

    console.log('API response', res);

    if (!isTranslateSuccess(res)) {
      vscode.window.showErrorMessage(res.text.join('\n') || 'Translation failed.');
      return;
    }

    const textLines = res.text;
    const fromLang = res.fromLang ?? from;
    const toLang = res.toLang ?? to;

    if (!editor?.document) { return; }

    const hadSelection = selected.trim().length > 0;
    const range = hadSelection
      ? editor.selection
      : new vscode.Range(editor.selection.active, editor.selection.active);

    hoverState.setState({
      text: textLines,
      range,
      from: fromLang,
      to: toLang,
      docUri: editor.document.uri.toString(),
      normalized: !skipNorm && config.normalizeText,
      version: res.version,
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
