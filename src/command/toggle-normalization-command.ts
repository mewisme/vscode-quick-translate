import * as vscode from 'vscode';

export function runToggleNormalizationCommand(): () => Promise<void> {
  return async function toggleNormalization(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('quickTranslate');
    const current = cfg.get<boolean>('normalizeText', true);
    const newValue = !current;
    await cfg.update(
      'normalizeText',
      newValue,
      vscode.ConfigurationTarget.Global
    );
  };
}
