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
      // Push state after clear (this is a new starting point)
      if (historyManager && canvas) {
        const state = serializeCanvas(canvas);
        historyManager.push(state);
      }
    },

    /**
     * Undo the last action
     */
    undo: async (): Promise<void> => {
      if (!canvas || !historyManager) return;
      
      const state = historyManager.undo();
      if (state !== null && state !== undefined) {
        // Suppress AFTER getting state, so restore won't add new history
        historyManager.suppressNext();
        await restoreCanvas(canvas, state);
        canvas.renderAll();
        // Small delay to ensure render is visible
        setTimeout(() => canvas.renderAll(), 10);
      }
    },

    /**
     * Redo the last undone action
     */
    redo: async (): Promise<void> => {
      if (!canvas || !historyManager) return;
      
      const state = historyManager.redo();
      if (state !== null && state !== undefined) {
        // Suppress AFTER getting state, so restore won't add new history
        historyManager.suppressNext();
        await restoreCanvas(canvas, state);
        canvas.renderAll();
        // Small delay to ensure render is visible
        setTimeout(() => canvas.renderAll(), 10);
      }
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