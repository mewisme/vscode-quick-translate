import * as vscode from 'vscode';

import { logToChannel } from '../output-channel';

let preloadPromise: Promise<void> | undefined;

export function preloadTranslator(): Promise<void> {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = runPreload();
  return preloadPromise;
}

async function runPreload(): Promise<void> {
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  statusBar.text = '$(sync~spin) Quick Translate: Initializing...';
  statusBar.show();

  try {
    await Promise.all([
      warmConnection(),
    ]);
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    if (!isAbort) {
      logToChannel('preload: connection warm-up failed', error);
    }
  } finally {
    statusBar.dispose();
  }
}

async function warmConnection(): Promise<void> {
  try {
    await fetch('https://translate.google.com', {
      method: 'HEAD',
    });
  } finally {
    logToChannel('preload: connection warm-up completed');
  }
}
