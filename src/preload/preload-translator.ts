import * as vscode from 'vscode';

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
  } catch {
  } finally {
    statusBar.dispose();
  }
}

async function warmConnection(): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch('https://translate.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
