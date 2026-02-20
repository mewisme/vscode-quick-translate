import * as vscode from 'vscode';

import { runClearLastTranslationCommand } from './command/clear-last-translation-command';
import { runCopyLastTranslationCommand } from './command/copy-last-translation-command';
import { runNormalizationPreviewCommand } from './command/normalization-preview-command';
import { runOpenSettingsCommand } from './command/open-settings-command';
import { runShowLastTranslationCommand } from './command/show-last-translation-command';
import { runTranslateCommand } from './command/translate-command';
import { createHoverState, type HoverStateController } from './hover/hover-state';
import { registerHoverProvider } from './hover/hover-provider';

let hoverStateController: HoverStateController | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const hoverState = createHoverState();
  hoverStateController = hoverState;

  context.subscriptions.push(
    registerHoverProvider(hoverState),
    vscode.commands.registerCommand(
      'quickTranslate.translateSelection',
      runTranslateCommand(hoverState)
    ),
    vscode.commands.registerCommand(
      'quickTranslate.translateWithoutNormalization',
      runTranslateCommand(hoverState, { skipNormalization: true })
    ),
    vscode.commands.registerCommand(
      'quickTranslate.showLastTranslation',
      runShowLastTranslationCommand(hoverState)
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

export function deactivate(): void {
  hoverStateController?.reset();
  hoverStateController = undefined;
}
