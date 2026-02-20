import * as vscode from 'vscode';

import { runClearLastTranslationCommand } from './command/clear-last-translation-command';
import { runCopyLastTranslationCommand } from './command/copy-last-translation-command';
import { runNormalizationPreviewCommand } from './command/normalization-preview-command';
import { runOpenSettingsCommand } from './command/open-settings-command';
import { runTranslateCommand } from './command/translate-command';
import { createHoverState } from './hover/hover-state';
import { registerHoverProvider } from './hover/hover-provider';

export function activate(context: vscode.ExtensionContext): void {
  const hoverState = createHoverState();

  context.subscriptions.push(
    registerHoverProvider(hoverState),
    new vscode.Disposable(() => hoverState.reset()),
    vscode.window.onDidChangeActiveTextEditor(() => hoverState.setShouldShowHover(false)),
    vscode.window.onDidChangeTextEditorSelection(() => hoverState.setShouldShowHover(false)),
    vscode.commands.registerCommand(
      'quickTranslate.translateSelection',
      runTranslateCommand(hoverState)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.translateWithoutNormalization',
      runTranslateCommand(hoverState, { skipNormalization: true })
    ),
    vscode.commands.registerCommand(
      'quickTranslate.clearLastTranslation',
      runClearLastTranslationCommand(hoverState)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.openSettings',
      runOpenSettingsCommand()
    ),
    vscode.commands.registerCommand(
      'quickTranslate.copyLastTranslation',
      runCopyLastTranslationCommand(hoverState)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.normalizationPreview',
      runNormalizationPreviewCommand(hoverState)
    )
  );
}

export function deactivate(): void {}
