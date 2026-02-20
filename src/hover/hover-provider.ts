import * as vscode from 'vscode';

import type { HoverStateController } from './hover-state';

const HOVER_DISPLAY_MAX_LENGTH = 4000;

function escapeMarkdownInline(raw: string): string {
  return raw.replace(/[\\*_[\]`#]/g, '\\$&');
}

function buildHoverMarkdown(state: {
  text: string;
  from: string;
  to: string;
  normalized?: boolean;
}): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = false;

  const fromEsc = escapeMarkdownInline(state.from);
  const toEsc = escapeMarkdownInline(state.to);

  md.appendMarkdown('**Translation**\n\n');
  md.appendMarkdown(`Source \`${fromEsc}\` → Target \`${toEsc}\`\n\n`);

  if (state.normalized === true) {
    md.appendMarkdown('*Normalization applied*\n\n');
  }

  md.appendMarkdown('---\n\n');
  md.appendMarkdown('Translation\n\n');

  const displayText =
    state.text.length > HOVER_DISPLAY_MAX_LENGTH
      ? state.text.slice(0, HOVER_DISPLAY_MAX_LENGTH) + '\n\n— truncated'
      : state.text;
  md.appendCodeblock(displayText, 'text');

  return md;
}

function createProvideHover(controller: HoverStateController) {
  return function provideHover(
    doc: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    if (!controller.getShouldShowHover()) { return; }
    const state = controller.getState();
    if (!state) { return; }
    if (doc.uri.toString() !== state.docUri) { return; }
    if (position.compareTo(state.range.start) < 0 || position.compareTo(state.range.end) > 0) { return; }
    return new vscode.Hover(buildHoverMarkdown(state), state.range);
  };
}

export function registerHoverProvider(
  controller: HoverStateController
): vscode.Disposable {
  return vscode.languages.registerHoverProvider('*', {
    provideHover: createProvideHover(controller),
  });
}
