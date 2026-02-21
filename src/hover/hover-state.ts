import * as vscode from 'vscode';

export type TranslateBackendVersion = 'v1' | 'v2';

export interface HoverStateData {
  text: string[];
  range: vscode.Range;
  from: string;
  to: string;
  docUri: string;
  normalized?: boolean;
  version?: TranslateBackendVersion;
  sourceText?: string;
  sourceWasAuto?: boolean;
}

export interface HoverStateController {
  setState(data: HoverStateData): void;
  getState(): HoverStateData | undefined;
  getStateVersion(): number;
  setShouldShowHover(value: boolean): void;
  getShouldShowHover(): boolean;
  reset(): void;
  /** Fires whenever state is set or reset. Consumers subscribe here instead of polling. */
  readonly onStateChange: vscode.Event<HoverStateData | undefined>;
}

export function createHoverState(): HoverStateController {
  let state: HoverStateData | undefined;
  let stateVersion = 0;
  let shouldShowHover = false;
  const emitter = new vscode.EventEmitter<HoverStateData | undefined>();

  return {
    setState(data: HoverStateData): void {
      state = data;
      stateVersion += 1;
      emitter.fire(data);
    },
    getState(): HoverStateData | undefined {
      return state;
    },
    getStateVersion(): number {
      return stateVersion;
    },
    setShouldShowHover(value: boolean): void {
      shouldShowHover = value;
    },
    getShouldShowHover(): boolean {
      return shouldShowHover;
    },
    reset(): void {
      state = undefined;
      shouldShowHover = false;
      emitter.fire(undefined);
    },
    get onStateChange(): vscode.Event<HoverStateData | undefined> {
      return emitter.event;
    },
  };
}
