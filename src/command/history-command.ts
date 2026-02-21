import * as vscode from 'vscode';

import type { HistoryEntry } from '../types/internal-types';
import type { TranslationHistory } from '../history/translation-history';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function buildEntryHtml(entry: HistoryEntry, index: number): string {
  const source = escapeHtml(entry.sourceText);
  const result = escapeHtml(entry.translatedText.join('\n'));
  const pair = escapeHtml(`${entry.from} → ${entry.to}`);
  const time = escapeHtml(formatTimestamp(entry.timestamp));
  return `
  <div class="entry" id="entry-${index}">
    <div class="entry-header">
      <span class="lang-pair"><code>${pair}</code></span>
      <span class="timestamp">${time}</span>
    </div>
    <div class="entry-body">
      <div class="col">
        <div class="label">Source</div>
        <pre>${source}</pre>
      </div>
      <div class="col">
        <div class="label">Translation</div>
        <pre>${result}</pre>
      </div>
    </div>
  </div>`;
}

function buildHtml(entries: HistoryEntry[]): string {
  const body = entries.length === 0
    ? '<p class="empty">No translations yet this session.</p>'
    : entries.map((e, i) => buildEntryHtml(e, i)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<title>Translation History</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 16px 20px;
    margin: 0;
    line-height: 1.5;
  }
  h1 {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0 0 16px 0;
    border-bottom: 1px solid var(--vscode-panel-border);
    padding-bottom: 10px;
    color: var(--vscode-foreground);
  }
  .empty {
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }
  .entry {
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: var(--vscode-sideBar-background);
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  .lang-pair {
    font-size: 0.9em;
  }
  .timestamp {
    font-size: 0.82em;
    color: var(--vscode-descriptionForeground);
  }
  .entry-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  .col {
    padding: 10px 12px;
  }
  .col:first-child {
    border-right: 1px solid var(--vscode-panel-border);
  }
  .label {
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 4px;
  }
  pre {
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    background: var(--vscode-textCodeBlock-background);
    border: 1px solid var(--vscode-panel-border);
    padding: 8px 10px;
    border-radius: 3px;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    max-height: 120px;
    overflow-y: auto;
  }
  code {
    font-family: var(--vscode-editor-font-family);
    font-size: 0.9em;
    background: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 2px;
  }
</style>
</head>
<body>
<h1>Translation History</h1>
${body}
</body>
</html>`;
}

export function runShowHistoryCommand(
  history: TranslationHistory
): () => void {
  let panel: vscode.WebviewPanel | undefined;

  return function showHistory(): void {
    const entries = history.getAll();
    const html = buildHtml(entries);

    if (panel) {
      try {
        panel.webview.html = html;
        panel.reveal(undefined, true);
        return;
      } catch {
        panel = undefined;
      }
    }

    panel = vscode.window.createWebviewPanel(
      'quickTranslate.history',
      'Translation History',
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: false,
        retainContextWhenHidden: false,
        localResourceRoots: [],
      }
    );

    panel.webview.html = html;
    panel.onDidDispose(() => {
      panel = undefined;
    });
  };
}
