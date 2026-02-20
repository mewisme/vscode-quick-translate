import type { HoverStateController } from '../hover/hover-state';
import type { TranslationRenderer, ViewMode } from '../types/renderer-types';
import { HoverRenderer } from './hover-renderer';
import { InlineRenderer } from './inline-renderer';
import { PanelRenderer } from './panel-renderer';

export interface TranslationViewCoordinator {
  getRenderer(mode: ViewMode): TranslationRenderer;
  clearAll(): void;
  dispose(): void;
}

export function createTranslationViewCoordinator(
  hoverState: HoverStateController
): TranslationViewCoordinator {
  const hoverRenderer = new HoverRenderer(hoverState);
  const panelRenderer = new PanelRenderer();
  const inlineRenderer = new InlineRenderer();

  return {
    getRenderer(mode: ViewMode): TranslationRenderer {
      switch (mode) {
        case 'panel':
          return panelRenderer;
        case 'inline':
          return inlineRenderer;
        default:
          return hoverRenderer;
      }
    },

    clearAll(): void {
      hoverState.reset();
      panelRenderer.clear();
      inlineRenderer.clear();
    },

    dispose(): void {
      panelRenderer.dispose();
      inlineRenderer.dispose();
    },
  };
}
