import * as vscode from 'vscode';

import { createHoverState } from './hover/hover-state';
import { createTranslationViewCoordinator } from './view/renderer';
import { registerHoverProvider } from './hover/hover-provider';
import { preloadTranslator } from './preload/preload-translator';
import { runClearLastTranslationCommand } from './command/clear-last-translation-command';
import { runCopyLastTranslationCommand } from './command/copy-last-translation-command';
import { runNormalizationPreviewCommand } from './command/normalization-preview-command';
import { runOpenSettingsCommand } from './command/open-settings-command';
import { runSwitchViewModeCommand } from './command/switch-view-mode-command';
import { runToggleNormalizationCommand } from './command/toggle-normalization-command';
import { runTranslateCommand } from './command/translate-command';

export function activate(context: vscode.ExtensionContext): void {
  const hoverState = createHoverState();
  const coordinator = createTranslationViewCoordinator(hoverState);

  void preloadTranslator();

  context.subscriptions.push(
    registerHoverProvider(hoverState),
    new vscode.Disposable(() => hoverState.reset()),
    new vscode.Disposable(() => coordinator.dispose()),
    vscode.window.onDidChangeActiveTextEditor(() => hoverState.setShouldShowHover(false)),
    vscode.window.onDidChangeTextEditorSelection(() => hoverState.setShouldShowHover(false)),
    vscode.commands.registerCommand(
      'quickTranslate.translateSelection',
      runTranslateCommand(hoverState, coordinator)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.translateWithoutNormalization',
      runTranslateCommand(hoverState, coordinator, { skipNormalization: true })
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
    )
  );
}

export function deactivate(): void { }
