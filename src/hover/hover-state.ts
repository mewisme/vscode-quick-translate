import * as vscode from 'vscode';

export interface HoverStateData {
  text: string;
  range: vscode.Range;
  from: string;
  to: string;
  docUri: string;
  normalized?: boolean;
}

export interface HoverStateController {
  setState(data: HoverStateData): void;
  getState(): HoverStateData | undefined;
  setShouldShowHover(value: boolean): void;
  getShouldShowHover(): boolean;
  reset(): void;
}

export function createHoverState(): HoverStateController {
  let state: HoverStateData | undefined;
  let shouldShowHover = false;
  return {
    setState(data: HoverStateData): void {
      state = data;
    },
    getState(): HoverStateData | undefined {
      return state;
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
    },
  };
}
