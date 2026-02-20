import * as vscode from 'vscode';

import type { HoverStateController } from '../hover/hover-state';
import type { RenderContext, TranslationRenderer } from '../types/renderer-types';

export class HoverRenderer implements TranslationRenderer {
  constructor(private readonly hoverState: HoverStateController) {}

  async render(context: RenderContext): Promise<void> {
    this.hoverState.setState({
      text: context.translatedText,
      range: context.selectionRange,
      from: context.from,
      to: context.to,
      docUri: context.editor.document.uri.toString(),
      normalized: context.normalized,
      version: context.version,
    });
    this.hoverState.setShouldShowHover(true);
    await vscode.commands.executeCommand('editor.action.showHover');
    this.hoverState.setShouldShowHover(false);
  }
}
