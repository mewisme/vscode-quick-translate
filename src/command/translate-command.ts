import * as vscode from 'vscode';

import { getQuickTranslateConfig } from '../config/get-config';
import type { HoverStateController } from '../hover/hover-state';
import { getNormalizeOptions } from '../normalize/normalize-config';
import { normalizeInput } from '../normalize/normalize-input';
import { detectIdentifierPattern } from '../normalize/detect-identifier';
import { translate, translateV2 } from '../translator';
import {
  isTranslateSuccess,
  type TranslateBackendVersion,
  type TranslateResult,
} from '../types/internal-types';
import type { MultiTargetResult, RenderContext } from '../types/renderer-types';
import type { TranslationViewCoordinator } from '../view/renderer';
import type { TranslationCache } from '../cache/translation-cache';
import type { TranslationHistory } from '../history/translation-history';

const LINE_SPLIT = /\r?\n/;
const BLANK_LINE = /^\s*$/;

let normalizationHintShown = false;

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

function parseTargetLanguages(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

async function translateLines(
  lines: string[],
  from: string,
  to: string,
  doTranslate: ReturnType<typeof getTranslateFn>
): Promise<TranslateResult> {
  const hasLineBreaks = lines.length > 1;
  const textToTranslate = lines.join('\n');

  if (!hasLineBreaks) {
    const raw = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Window, title: 'Translating…', cancellable: false },
      () => doTranslate(textToTranslate, from, to)
    );
    return raw.error === false
      ? {
          error: false,
          text: [raw.text],
          fromLang: raw.fromLang ?? from,
          toLang: raw.toLang ?? to,
          version: raw.version,
        }
      : { error: true, text: [raw.text] };
  }

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
    return { error: true, text: [firstFailure.error] };
  }

  const okLines = textArray as LineOk[];
  const firstWithLang = okLines.find((x) => x.fromLang !== undefined);
  const firstWithVersion = okLines.find((x) => x.version !== undefined);
  return {
    error: false,
    text: okLines.map((x) => x.text),
    fromLang: firstWithLang?.fromLang ?? from,
    toLang: to,
    version: firstWithVersion?.version ?? 'v1',
  };
}

export function runTranslateCommand(
  hoverState: HoverStateController,
  coordinator: TranslationViewCoordinator,
  cache: TranslationCache,
  history: TranslationHistory,
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

    // Large selection guard
    if (input.length > config.largeSelectionThreshold) {
      const choice = await vscode.window.showWarningMessage(
        `The selected text is ${input.length} characters, which exceeds the threshold of ${config.largeSelectionThreshold}. Very large inputs may produce poor translation quality or hit API limits.`,
        'Continue',
        'Cancel'
      );
      if (choice !== 'Continue') { return; }
    }

    const rawLines = input.split(LINE_SPLIT);
    const skipNorm = options?.skipNormalization === true;
    const normOpts = skipNorm ? undefined : getNormalizeOptions(config);

    // Smart normalization hint (one-time per session)
    if (!skipNorm && !config.normalizeText && !normalizationHintShown) {
      const pattern = detectIdentifierPattern(input.trim());
      if (pattern !== null) {
        normalizationHintShown = true;
        void vscode.window.showInformationMessage(
          `The selected text looks like a ${pattern} identifier. Enable "Quick Translate: Normalize Text" to automatically split it into words before translating.`,
          'Open Settings'
        ).then((choice) => {
          if (choice === 'Open Settings') {
            void vscode.commands.executeCommand('quickTranslate.openSettings');
          }
        });
      }
    }

    // maxLineCount cap
    let cappedLines = rawLines;
    if (rawLines.length > config.maxLineCount) {
      cappedLines = rawLines.slice(0, config.maxLineCount);
      vscode.window.showInformationMessage(
        `Selection has ${rawLines.length} lines. Only the first ${config.maxLineCount} lines will be translated (controlled by quickTranslate.maxLineCount).`
      );
    }

    const lines: string[] =
      !normOpts || !normOpts.normalizeText
        ? cappedLines
        : cappedLines.map((line) => normalizeInput(line, normOpts));

    const textToTranslate = lines.join('\n');

    // Multi-target translation (panel-only)
    const targetLangs = parseTargetLanguages(config.targetLanguages);
    if (targetLangs.length > 0) {
      await runMultiTargetTranslation(
        lines, textToTranslate, from, targetLangs, doTranslate,
        config, skipNorm, input, editor, hoverState, coordinator, cache, history
      );
      return;
    }

    // Cache lookup
    const cacheKey = { text: textToTranslate, from, to, version: config.translateVersion };
    const cached = cache.get(cacheKey);

    let res: TranslateResult;
    if (cached) {
      res = {
        error: false,
        text: cached.text,
        fromLang: cached.fromLang,
        toLang: cached.toLang,
        version: cached.version,
      };
    } else {
      try {
        res = await translateLines(lines, from, to, doTranslate);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        res = { error: true, text: [msg] };
      }

      if (isTranslateSuccess(res)) {
        cache.set(cacheKey, {
          text: res.text,
          fromLang: res.fromLang ?? from,
          toLang: res.toLang ?? to,
          version: res.version,
        });
      }
    }

    if (!isTranslateSuccess(res)) {
      vscode.window.showErrorMessage(res.text.join('\n') || 'Translation failed.');
      return;
    }

    const textLines = res.text;
    const fromLang = res.fromLang ?? from;
    const toLang = res.toLang ?? to;

    // Record in history
    history.add({
      sourceText: input,
      translatedText: textLines,
      from: fromLang,
      to: toLang,
      timestamp: new Date(),
    });

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
      sourceText: input,
      sourceWasAuto: from === 'auto',
    });

    const renderContext: RenderContext = {
      translatedText: textLines,
      from: fromLang,
      to: toLang,
      normalized: !skipNorm && config.normalizeText,
      editor,
      selectionRange: range,
      version: res.version,
      sourceWasAuto: from === 'auto',
    };

    const renderer = coordinator.getRenderer(config.viewMode);
    await renderer.render(renderContext);
  };
}

async function runMultiTargetTranslation(
  lines: string[],
  textToTranslate: string,
  from: string,
  targetLangs: string[],
  doTranslate: ReturnType<typeof getTranslateFn>,
  config: ReturnType<typeof import('../config/get-config').getQuickTranslateConfig>,
  skipNorm: boolean,
  input: string,
  editor: vscode.TextEditor | undefined,
  hoverState: HoverStateController,
  coordinator: TranslationViewCoordinator,
  cache: TranslationCache,
  history: TranslationHistory
): Promise<void> {
  const multiTarget: MultiTargetResult[] = [];
  let firstFromLang = from;
  let firstVersion: TranslateBackendVersion = config.translateVersion;

  for (const targetLang of targetLangs) {
    const cacheKey = { text: textToTranslate, from, to: targetLang, version: config.translateVersion };
    const cached = cache.get(cacheKey);

    let res: TranslateResult;
    if (cached) {
      res = {
        error: false,
        text: cached.text,
        fromLang: cached.fromLang,
        toLang: cached.toLang,
        version: cached.version,
      };
    } else {
      try {
        res = await translateLines(lines, from, targetLang, doTranslate);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        res = { error: true, text: [msg] };
      }

      if (isTranslateSuccess(res)) {
        cache.set(cacheKey, {
          text: res.text,
          fromLang: res.fromLang ?? from,
          toLang: res.toLang ?? targetLang,
          version: res.version,
        });
      }
    }

    if (isTranslateSuccess(res)) {
      multiTarget.push({ to: targetLang, text: res.text });
      firstFromLang = res.fromLang ?? from;
      firstVersion = res.version;

      history.add({
        sourceText: input,
        translatedText: res.text,
        from: res.fromLang ?? from,
        to: targetLang,
        timestamp: new Date(),
      });
    } else {
      multiTarget.push({ to: targetLang, text: [`[Error: ${res.text.join(' ')}]`] });
    }
  }

  if (!editor?.document) { return; }

  const hadSelection = input === (editor?.document.getText(editor.selection) ?? '').trim();
  const range = hadSelection
    ? editor.selection
    : new vscode.Range(editor.selection.active, editor.selection.active);

  hoverState.setState({
    text: multiTarget.map((t) => t.text.join('\n')),
    range,
    from: firstFromLang,
    to: targetLangs.join(', '),
    docUri: editor.document.uri.toString(),
    normalized: !skipNorm && config.normalizeText,
    version: firstVersion,
    sourceText: input,
    sourceWasAuto: from === 'auto',
  });

  const renderContext: RenderContext = {
    translatedText: multiTarget[0]?.text ?? [],
    from: firstFromLang,
    to: targetLangs[0] ?? config.targetLanguage,
    normalized: !skipNorm && config.normalizeText,
    editor,
    selectionRange: range,
    version: firstVersion,
    sourceWasAuto: from === 'auto',
    multiTarget,
  };

  const renderer = coordinator.getRenderer('panel');
  await renderer.render(renderContext);
}
