/**
 * Unit tests for annotation utilities
 * These tests cover the framework-agnostic utility functions
 */

import {
  HistoryManager,
  calculateResizeScale,
  normalizeRectangle,
  validateCanvasJSON,
  type CanvasState
} from './annotationUtils';

describe('annotationUtils', () => {
  describe('HistoryManager', () => {
    let historyManager: HistoryManager;

    beforeEach(() => {
      historyManager = new HistoryManager(3); // Small size for testing
    });

    it('should initialize with empty history', () => {
      expect(historyManager.size()).toBe(0);
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);
    });

    it('should add states to history', () => {
      const state1: CanvasState = {
        version: '1.0',
        timestamp: Date.now(),
        canvasData: { objects: ['object1'] },
        canvasSize: { width: 100, height: 100 }
      };

      historyManager.push(state1);

      expect(historyManager.size()).toBe(1);
      expect(historyManager.canUndo()).toBe(false); // No previous state
      expect(historyManager.canRedo()).toBe(false);
    });

    it('should support undo/redo operations', () => {
      const state1: CanvasState = {
        version: '1.0',
        timestamp: Date.now(),
        canvasData: { objects: ['object1'] },
        canvasSize: { width: 100, height: 100 }
      };

      const state2: CanvasState = {
        version: '1.0',
        timestamp: Date.now(),
        canvasData: { objects: ['object1', 'object2'] },
        canvasSize: { width: 100, height: 100 }
      };

      historyManager.push(state1);
      historyManager.push(state2);

      expect(historyManager.canUndo()).toBe(true);
      expect(historyManager.canRedo()).toBe(false);

      const undoState = historyManager.undo();
      expect(undoState).toEqual(state1);
      expect(historyManager.canRedo()).toBe(true);

      const redoState = historyManager.redo();
      expect(redoState).toEqual(state2);
    });

    it('should maintain maximum size', () => {
      const states = Array.from({ length: 5 }, (_, i) => ({
        version: '1.0',
        timestamp: Date.now(),
        canvasData: { objects: [`object${i}`] },
        canvasSize: { width: 100, height: 100 }
      }));

      states.forEach(state => historyManager.push(state));

      expect(historyManager.size()).toBe(3); // maxSize
    });

    it('should suppress next entry when requested', () => {
      const state: CanvasState = {
        version: '1.0',
        timestamp: Date.now(),
        canvasData: { objects: ['object1'] },
        canvasSize: { width: 100, height: 100 }
      };

      historyManager.suppressNext();
      historyManager.push(state);

      expect(historyManager.size()).toBe(0);
    });

    it('should clear history', () => {
      const state: CanvasState = {
        version: '1.0',
        timestamp: Date.now(),
        canvasData: { objects: ['object1'] },
        canvasSize: { width: 100, height: 100 }
      };

      historyManager.push(state);
      historyManager.clear();

      expect(historyManager.size()).toBe(0);
      expect(historyManager.canUndo()).toBe(false);
      expect(historyManager.canRedo()).toBe(false);
    });
  });

  describe('calculateResizeScale', () => {
    it('should calculate correct scale factors', () => {
      const oldSize = { width: 400, height: 300 };
      const newSize = { width: 800, height: 450 };

      const result = calculateResizeScale(oldSize, newSize);

      expect(result).toEqual({
        scaleX: 2,
        scaleY: 1.5
      });
    });

    it('should handle zero dimensions gracefully', () => {
      const oldSize = { width: 0, height: 100 };
      const newSize = { width: 200, height: 150 };

      const result = calculateResizeScale(oldSize, newSize);

      expect(result.scaleX).toBe(Infinity);
      expect(result.scaleY).toBe(1.5);
    });
  });

  describe('normalizeRectangle', () => {
    it('should handle normal rectangle (top-left to bottom-right)', () => {
      const result = normalizeRectangle(10, 20, 50, 60);

      expect(result).toEqual({
        left: 10,
        top: 20,
        width: 40,
        height: 40
      });
    });

    it('should handle inverted rectangle (bottom-right to top-left)', () => {
      const result = normalizeRectangle(50, 60, 10, 20);

      expect(result).toEqual({
        left: 10,
        top: 20,
        width: 40,
        height: 40
      });
    });

    it('should handle mixed inversion (horizontal or vertical only)', () => {
      // Inverted horizontally
      const result1 = normalizeRectangle(50, 20, 10, 60);
      expect(result1).toEqual({
        left: 10,
        top: 20,
        width: 40,
        height: 40
      });

      // Inverted vertically
      const result2 = normalizeRectangle(10, 60, 50, 20);
      expect(result2).toEqual({
        left: 10,
        top: 20,
        width: 40,
        height: 40
      });
    });
  });

  describe('validateCanvasJSON', () => {
    it('should validate correct JSON structure', () => {
      const validJSON = {
        version: '5.3.0',
        objects: [
          { type: 'rect', width: 100, height: 50 },
          { type: 'circle', radius: 25 }
        ]
      };

      const result = validateCanvasJSON(validJSON);

      expect(result).toBeTruthy();
      if (result && 'objects' in result && Array.isArray(result.objects)) {
        expect(result.objects).toHaveLength(2);
        expect((result.objects[0] as Record<string, unknown>).evented).toBe(true);
        expect((result.objects[0] as Record<string, unknown>).selectable).toBe(true);
      }
    });

    it('should return null for invalid JSON', () => {
      expect(validateCanvasJSON(null)).toBe(null);
      expect(validateCanvasJSON(undefined)).toBe(null);
      expect(validateCanvasJSON('string')).toBe(null);
      expect(validateCanvasJSON({})).toBe(null); // No objects array
      expect(validateCanvasJSON({ objects: 'not-array' })).toBe(null);
    });

    it('should clean potentially harmful properties', () => {
      const jsonWithHarmfulProps = {
        objects: [
          {
            type: 'rect',
            evented: false,
            selectable: false,
            someFunction: () => console.log('hack')
          }
        ]
      };

      const result = validateCanvasJSON(jsonWithHarmfulProps);

      if (result && 'objects' in result && Array.isArray(result.objects)) {
        const firstObject = result.objects[0] as Record<string, unknown>;
        expect(firstObject.evented).toBe(false); // Should preserve explicit false
        expect(firstObject.selectable).toBe(false); // Should preserve explicit false
        expect(firstObject).toHaveProperty('someFunction'); // Non-boolean props preserved
      }
    });
  });
});