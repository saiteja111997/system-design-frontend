/**
 * Imperative API handlers for the annotation layer
 */

import { serializeCanvas, restoreCanvas, type CanvasState } from '../../../utils/annotationUtils';
import type { FabricCanvas, HistoryManager } from './types';

/**
 * Create imperative handlers for external control of the annotation layer
 */
export function createImperativeHandlers(
  canvas: FabricCanvas | null,
  historyManager: HistoryManager | null
) {
  return {
    /**
     * Take a snapshot of the current canvas state
     */
    snapshot: (): CanvasState | null => {
      if (!canvas) return null;
      return serializeCanvas(canvas);
    },

    /**
     * Load canvas state from a snapshot
     */
    load: async (snapshot: CanvasState | null): Promise<void> => {
      if (!canvas || !snapshot) return;
      return restoreCanvas(canvas, snapshot);
    },

    /**
     * Export canvas as PNG
     */
    exportPNG: (options?: { 
      format?: 'png' | 'jpeg';
      quality?: number;
      multiplier?: number;
    }): string | null => {
      if (!canvas) return null;

      const defaults = {
        format: 'png' as const,
        quality: 1,
        multiplier: 1
      };

      const config = { ...defaults, ...options };

      return canvas.toDataURL({
        format: config.format,
        quality: config.quality,
        multiplier: config.multiplier
      });
    },

    /**
     * Export canvas as SVG
     */
    exportSVG: (): string | null => {
      if (!canvas) return null;
      return canvas.toSVG();
    },

    /**
     * Clear the entire canvas
     */
    clear: (): void => {
      if (!canvas) return;
      canvas.clear();
      canvas.renderAll();
      historyManager?.saveState();
    },

    /**
     * Undo the last action
     */
    undo: (): void => {
      historyManager?.undo();
    },

    /**
     * Redo the last undone action
     */
    redo: (): void => {
      historyManager?.redo();
    },

    /**
     * Get current canvas state
     */
    getCanvas: (): FabricCanvas | null => {
      return canvas;
    },

    /**
     * Check if undo is available
     */
    canUndo: (): boolean => {
      return historyManager?.canUndo() ?? false;
    },

    /**
     * Check if redo is available
     */
    canRedo: (): boolean => {
      return historyManager?.canRedo() ?? false;
    }
  };
}