import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function initOutputChannel(): vscode.OutputChannel {
  channel ??= vscode.window.createOutputChannel('Quick Translate');
  return channel;
}

export function getOutputChannel(): vscode.OutputChannel {
  return channel ?? initOutputChannel();
}

export function disposeOutputChannel(): void {
  channel?.dispose();
  channel = undefined;
}

export function logToChannel(message: string, error?: unknown): void {
  const ch = getOutputChannel();
  const ts = new Date().toISOString();
  ch.appendLine(`[${ts}] ${message}`);
  if (error !== undefined) {
    ch.appendLine(error instanceof Error ? error.stack ?? error.message : String(error));
  }
}
