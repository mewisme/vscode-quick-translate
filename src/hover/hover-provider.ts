import * as vscode from 'vscode';

import type { HoverStateController } from './hover-state';

const HOVER_DISPLAY_MAX_LENGTH = 4000;

function escapeMarkdownInline(raw: string): string {
  return raw.replace(/[\\*_[\]`#]/g, '\\$&');
}

function buildHoverMarkdown(state: {
  text: string[];
  from: string;
  to: string;
  normalized?: boolean;
  version?: 'v1' | 'v2';
  sourceWasAuto?: boolean;
}): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = false;

  const fromEsc = escapeMarkdownInline(state.from);
  const toEsc = escapeMarkdownInline(state.to);

  md.appendMarkdown('**Translation**\n\n');
  if (state.sourceWasAuto) {
    md.appendMarkdown(`Source \`auto\` → \`${fromEsc}\` *(detected)* → Target \`${toEsc}\``);
  } else {
    md.appendMarkdown(`Source \`${fromEsc}\` → Target \`${toEsc}\``);
  }
  if (state.version) {
    md.appendMarkdown(` · \`${state.version}\``);
  }
  md.appendMarkdown('\n\n');

  if (state.normalized === true) {
    md.appendMarkdown('*Normalization applied*\n\n');
  }

  md.appendMarkdown('---\n\n');
  md.appendMarkdown('Translation\n\n');

  const fullText = state.text.join('\n');
  const displayText =
    fullText.length > HOVER_DISPLAY_MAX_LENGTH
      ? fullText.slice(0, HOVER_DISPLAY_MAX_LENGTH) + '\n\n— truncated'
      : fullText;
  const codeBlockContent = displayText.replace(/`/g, '\`');
  md.appendMarkdown('```text\n' + codeBlockContent + '\n```');

  return md;
}

function createProvideHover(controller: HoverStateController) {
  return function provideHover(
    doc: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    if (!controller.getShouldShowHover()) {
      return;
    }
    const state = controller.getState();
    const lastRange = state?.range;
    if (lastRange === undefined || state === undefined) {
      return;
    }
    if (doc.uri.toString() !== state.docUri) {
      return;
    }
    if (position.compareTo(lastRange.start) < 0 || position.compareTo(lastRange.end) >= 0) {
      return;
    }
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
