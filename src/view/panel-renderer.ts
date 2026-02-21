import * as vscode from 'vscode';

import type { RenderContext, TranslationRenderer } from '../types/renderer-types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSourceLabel(context: RenderContext): string {
  const from = escapeHtml(context.from);
  if (context.sourceWasAuto) {
    return `Source <code>auto</code> &rarr; <code>${from}</code> <span class="detected">(detected)</span>`;
  }
  return `Source <code>${from}</code>`;
}

function buildSingleSection(_to: string, text: string[]): string {
  const content = escapeHtml(text.join('\n'));
  return `<pre>${content}</pre>`;
}

function buildMultiSections(context: RenderContext): string {
  if (!context.multiTarget || context.multiTarget.length === 0) {
    return buildSingleSection(context.to, context.translatedText);
  }
  return context.multiTarget.map((target) => {
    const to = escapeHtml(target.to);
    const content = escapeHtml(target.text.join('\n'));
    return `<div class="target-section">
  <div class="target-label">Target <code>${to}</code></div>
  <pre>${content}</pre>
</div>`;
  }).join('\n');
}

function buildHtml(context: RenderContext): string {
  const versionBadge = context.version
    ? ` &middot; <code>${escapeHtml(context.version)}</code>`
    : '';
  const normalizedNote = context.normalized
    ? '<p class="note">Normalization applied</p>'
    : '';
  const isMulti = context.multiTarget && context.multiTarget.length > 1;
  const targetInfo = isMulti
    ? `${context.multiTarget!.length} languages`
    : `Target <code>${escapeHtml(context.to)}</code>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<title>Translation</title>
<style>
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 16px 20px;
    margin: 0;
    line-height: 1.5;
  }
  .header {
    border-bottom: 1px solid var(--vscode-panel-border);
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  .meta {
    font-size: 0.9em;
    color: var(--vscode-descriptionForeground);
    margin: 0 0 4px 0;
  }
  code {
    font-family: var(--vscode-editor-font-family);
    font-size: 0.9em;
    background: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 2px;
  }
  .note {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    margin: 6px 0 0 0;
  }
  .detected {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }
  pre {
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    background: var(--vscode-textCodeBlock-background);
    border: 1px solid var(--vscode-panel-border);
    padding: 12px 16px;
    border-radius: 3px;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    overflow-x: auto;
  }
  .target-section {
    margin-bottom: 16px;
  }
  .target-section:last-child {
    margin-bottom: 0;
  }
  .target-label {
    font-size: 0.85em;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 6px;
    font-weight: 600;
  }
</style>
</head>
<body>
<div class="header">
  <p class="meta">${buildSourceLabel(context)} &rarr; ${targetInfo}${versionBadge}</p>
  ${normalizedNote}
</div>
${buildMultiSections(context)}
</body>
</html>`;
}

export class PanelRenderer implements TranslationRenderer {
  private panel: vscode.WebviewPanel | undefined;

  async render(context: RenderContext): Promise<void> {
    const html = buildHtml(context);

    if (this.panel) {
      try {
        this.panel.webview.html = html;
        this.panel.reveal(undefined, true);
        return;
      } catch {
        this.panel = undefined;
      }
    }

    const panel = vscode.window.createWebviewPanel(
      'quickTranslate.translation',
      'Translation',
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: false,
        retainContextWhenHidden: false,
        localResourceRoots: [],
      }
    );

    panel.webview.html = html;
    panel.onDidDispose(() => {
      if (this.panel === panel) {
        this.panel = undefined;
      }
    });
    this.panel = panel;
  }

  clear(): void {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }
  }

  dispose(): void {
    this.clear();
  }
}
