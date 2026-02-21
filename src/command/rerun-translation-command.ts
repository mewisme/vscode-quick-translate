import * as vscode from 'vscode';

import { getQuickTranslateConfig } from '../config/get-config';
import type { HoverStateController } from '../hover/hover-state';
import { translate, translateV2 } from '../translator';
import {
  isTranslateSuccess,
  type TranslateBackendVersion,
} from '../types/internal-types';
import type { TranslationViewCoordinator } from '../view/renderer';

const LINE_SPLIT = /\r?\n/;
const BLANK_LINE = /^\s*$/;

type LineOk = { ok: true; text: string; fromLang?: string; version?: TranslateBackendVersion };
type LineErr = { ok: false; error: string };
type LineResult = LineOk | LineErr;

function toLineResult(r: {
  error: boolean;
  text: string;
  fromLang?: string;
  version?: TranslateBackendVersion;
}): LineResult {
  if (!r.error) {
    return { ok: true, text: r.text ?? '', fromLang: r.fromLang, version: r.version as TranslateBackendVersion };
  }
  return { ok: false, error: r.text };
}

export function runRerunTranslationCommand(
  hoverState: HoverStateController,
  coordinator: TranslationViewCoordinator
): () => Promise<void> {
  return async function rerunLastTranslation(): Promise<void> {
    const stored = hoverState.getState();
    if (!stored?.sourceText) {
      vscode.window.showInformationMessage('No previous translation to re-run.');
      return;
    }

    const config = getQuickTranslateConfig();
    const from = config.sourceLanguage;
    const to = config.targetLanguage;
    const doTranslate = config.translateVersion === 'v2' ? translateV2 : translate;

    const input = stored.sourceText;
    const lines = input.split(LINE_SPLIT);
    const hasLineBreaks = lines.length > 1;

    let textLines: string[];
    let fromLang: string;
    let toLang: string;
    let version: TranslateBackendVersion;

    try {
      if (!hasLineBreaks) {
        const raw = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Window, title: 'Translating…', cancellable: false },
          () => doTranslate(input, from, to)
        );
        if (raw.error) {
          vscode.window.showErrorMessage(raw.text || 'Translation failed.');
          return;
        }
        textLines = [raw.text];
        fromLang = raw.fromLang ?? from;
        toLang = raw.toLang ?? to;
        version = raw.version;
      } else {
        const textArray: LineResult[] = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Window, title: 'Translating…', cancellable: false },
          async (progress) => {
            let done = 0;
            const nonBlankCount = lines.filter((l) => !BLANK_LINE.test(l)).length;
            const linePromises = lines.map((line) =>
              BLANK_LINE.test(line)
                ? Promise.resolve({ ok: true as const, text: '' })
                : doTranslate(line, from, to).then((r) => {
                    done++;
                    progress.report({
                      increment: (1 / nonBlankCount) * 100,
                      message: `${done} / ${nonBlankCount} lines`,
                    });
                    return toLineResult(r);
                  })
            );
            return Promise.all(linePromises);
          }
        );
        const firstFailure = textArray.find((x): x is LineErr => !x.ok);
        if (firstFailure) {
          vscode.window.showErrorMessage(firstFailure.error || 'Translation failed.');
          return;
        }
        const okLines = textArray as LineOk[];
        const firstWithLang = okLines.find((x) => x.fromLang !== undefined);
        const firstWithVersion = okLines.find((x) => x.version !== undefined);
        textLines = okLines.map((x) => x.text);
        fromLang = firstWithLang?.fromLang ?? from;
        toLang = to;
        version = firstWithVersion?.version ?? config.translateVersion;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      vscode.window.showErrorMessage(msg);
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('Translation updated. Open a file to display the result.');
      return;
    }

    const range = editor.selection.isEmpty
      ? new vscode.Range(editor.selection.active, editor.selection.active)
      : editor.selection;

    hoverState.setState({
      text: textLines,
      range,
      from: fromLang,
      to: toLang,
      docUri: editor.document.uri.toString(),
      version,
      sourceText: input,
      sourceWasAuto: from === 'auto',
    });

    const res = { error: false as const, text: textLines, fromLang, toLang, version };
    if (!isTranslateSuccess(res)) { return; }

    const renderer = coordinator.getRenderer(config.viewMode);
    await renderer.render({
      translatedText: textLines,
      from: fromLang,
      to: toLang,
      normalized: false,
      editor,
      selectionRange: range,
      version,
      sourceWasAuto: from === 'auto',
    });
  };
}
