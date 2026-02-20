import * as vscode from 'vscode';

export function runOpenSettingsCommand(ctx: vscode.ExtensionContext): () => Promise<void> {
  return async function openSettings(): Promise<void> {
    const { publisher, name } = ctx.extension.packageJSON as { publisher: string; name: string };
    const extId = `${publisher}.${name}`;
    await vscode.commands.executeCommand(
      'workbench.action.openSettings',
      `@ext:${extId} quickTranslate`
    );
  };
}
