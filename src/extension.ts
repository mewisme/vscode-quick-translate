import * as vscode from 'vscode';

import { createTranslationCache } from './cache/translation-cache';
import { runClearLastTranslationCommand } from './command/clear-last-translation-command';
import { runCopyLastTranslationCommand } from './command/copy-last-translation-command';
import { runShowHistoryCommand } from './command/history-command';
import { runNormalizationPreviewCommand } from './command/normalization-preview-command';
import { runOpenSettingsCommand } from './command/open-settings-command';
import { runRerunTranslationCommand } from './command/rerun-translation-command';
import { runSwitchViewModeCommand } from './command/switch-view-mode-command';
import { runToggleNormalizationCommand } from './command/toggle-normalization-command';
import { runTranslateCommand } from './command/translate-command';
import { createTranslationHistory } from './history/translation-history';
import { createHoverState } from './hover/hover-state';
import { registerHoverProvider } from './hover/hover-provider';
import { preloadTranslator } from './preload/preload-translator';
import { disposeOutputChannel, initOutputChannel } from './output-channel';
import { createTargetLanguageStatusBar } from './status-bar';
import { createTranslationViewCoordinator } from './view/renderer';
import { getQuickTranslateConfig } from './config/get-config';

let translationCacheRef: ReturnType<typeof createTranslationCache> | undefined;
let translationHistoryRef: ReturnType<typeof createTranslationHistory> | undefined;
let coordinatorRef: ReturnType<typeof createTranslationViewCoordinator> | undefined;

export function activate(context: vscode.ExtensionContext): void {
  initOutputChannel();
  const hoverState = createHoverState();
  const coordinator = createTranslationViewCoordinator(hoverState);

  const config = getQuickTranslateConfig();
  translationCacheRef = createTranslationCache();
  translationHistoryRef = createTranslationHistory(config.historySize);
  coordinatorRef = coordinator;

  const cache = translationCacheRef;
  const history = translationHistoryRef;

  void preloadTranslator();

  createTargetLanguageStatusBar(context);

  context.subscriptions.push(
    registerHoverProvider(hoverState),
    new vscode.Disposable(() => hoverState.reset()),
    new vscode.Disposable(() => coordinator.dispose()),
    vscode.window.onDidChangeActiveTextEditor(() => hoverState.setShouldShowHover(false)),
    vscode.window.onDidChangeTextEditorSelection(() => hoverState.setShouldShowHover(false)),
    vscode.commands.registerCommand(
      'quickTranslate.translateSelection',
      runTranslateCommand(hoverState, coordinator, cache, history)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.translateWithoutNormalization',
      runTranslateCommand(hoverState, coordinator, cache, history, { skipNormalization: true })
    ),
    vscode.commands.registerCommand(
      'quickTranslate.clearLastTranslation',
      runClearLastTranslationCommand(coordinator)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.openSettings',
      runOpenSettingsCommand(context)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.copyLastTranslation',
      runCopyLastTranslationCommand(hoverState)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.normalizationPreview',
      runNormalizationPreviewCommand(hoverState)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.toggleNormalization',
      runToggleNormalizationCommand()
    ),
    vscode.commands.registerCommand(
      'quickTranslate.switchViewMode',
      runSwitchViewModeCommand()
    ),
    vscode.commands.registerCommand(
      'quickTranslate.rerunLastTranslation',
      runRerunTranslationCommand(hoverState, coordinator)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.acceptTranslation',
      () => coordinator.acceptInlineTranslation()
    ),
    vscode.commands.registerCommand(
      'quickTranslate.showHistory',
      runShowHistoryCommand(history)
    )
  );
}

export function deactivate(): void {
  coordinatorRef?.dispose();
  translationCacheRef?.clear();
  translationHistoryRef?.clear();
  disposeOutputChannel();
  coordinatorRef = undefined;
  translationCacheRef = undefined;
  translationHistoryRef = undefined;
}
