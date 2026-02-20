import * as vscode from 'vscode';

const VIEW_MODES: Array<'hover' | 'panel' | 'inline'> = ['hover', 'panel', 'inline'];

function nextViewMode(current: string): 'hover' | 'panel' | 'inline' {
  const idx = VIEW_MODES.indexOf(current as 'hover' | 'panel' | 'inline');
  const nextIdx = idx < 0 ? 0 : (idx + 1) % VIEW_MODES.length;
  return VIEW_MODES[nextIdx];
}

export function runSwitchViewModeCommand(): () => Promise<void> {
  return async function switchViewMode(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('quickTranslate');
    const current = cfg.get<string>('viewMode', 'panel');
    const next = nextViewMode(current);
    await cfg.update(
      'viewMode',
      next,
      vscode.ConfigurationTarget.Global
    );
  };
}
