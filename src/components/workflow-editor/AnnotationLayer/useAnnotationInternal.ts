"use client";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useCanvasSetup, useDrawingState, useHistoryManager } from './hooks';
import { createMouseDownHandler, createMouseMoveHandler, createMouseUpHandler } from './mouseHandlers';
import { createKeyDownHandler } from './keyboardHandlers';
import { updateCanvasMode, applyThemeColors } from './canvasOperations';
import { serializeCanvas, restoreCanvas } from '../../../utils/annotationUtils';
import type { AnnotationLayerProps, AnnotationLayerHandle, FabricEvent } from './types';

// Type alias for cleaner canvas casting
type AnnotationCanvas = import('../../../utils/annotationUtils').FabricCanvas;

/**
 * Helper to defer canvas rendering until next animation frame
 * This consolidates multiple render calls into one browser-optimized repaint
 */
function deferredRender(canvas: AnnotationCanvas, callback?: () => void): void {
  requestAnimationFrame(() => {
    canvas.renderAll();
    callback?.();
  });
}

export function useAnnotationInternal(props: AnnotationLayerProps, ref: React.Ref<AnnotationLayerHandle>) {
  const { activeTool, onFinish, initialJSON } = props;
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { canvasRef, fabricCanvasRef, containerRef, initializeCanvas, cleanup } = useCanvasSetup();
  const { drawingState, setDrawingState } = useDrawingState();
  
  const canvas = fabricCanvasRef.current;
  
  // Lock to prevent concurrent undo/redo operations
  const undoRedoLockRef = useRef(false);
  
  // Flag to completely block history saves during undo/redo restore operations
  const blockHistorySavesRef = useRef(false);
  
  // Flag to track if initial history has been saved
  const initialHistorySavedRef = useRef(false);
  
  // Pass canvas AND block flag to history manager so it can check before saving
  const { historyManagerRef, saveToHistory, saveToHistoryImmediate } = useHistoryManager(canvas, blockHistorySavesRef);
  const historyManager = historyManagerRef.current;

  // Undo handler with proper ref access
  const handleUndo = useCallback(async () => {
    if (!canvas || !historyManager) return;
    
    // Check lock to prevent concurrent undo/redo operations
    if (undoRedoLockRef.current) {
      console.warn('[AnnotationLayer] Undo operation already in progress');
      return;
    }
    
    // Set lock BEFORE try block to ensure it's set synchronously
    undoRedoLockRef.current = true;
    blockHistorySavesRef.current = true; // Block ALL history saves during undo
    
    try {
      const state = historyManager.undo(); 
      if (state) {
        // restoreCanvas handles the async delay (up to 300ms timeout)
        await restoreCanvas(canvas as AnnotationCanvas, state);
        // Use deferred render for optimized repaint
        deferredRender(canvas as AnnotationCanvas);
      }
    } catch (error) {
      console.error('[AnnotationLayer] Failed to undo:', error);
    } finally {
      // Release locks immediately after restoreCanvas completes
      // The await above already provides necessary timing protection
      undoRedoLockRef.current = false;
      blockHistorySavesRef.current = false;
    }
  }, [canvas, historyManager]);

  // Redo handler with proper ref access
  const handleRedo = useCallback(async () => {
    if (!canvas || !historyManager) return;
    
    // Check lock to prevent concurrent undo/redo operations
    if (undoRedoLockRef.current) {
      console.warn('[AnnotationLayer] Redo operation already in progress');
      return;
    }
    
    // Set lock BEFORE try block to ensure it's set synchronously
    undoRedoLockRef.current = true;
    blockHistorySavesRef.current = true; // Block ALL history saves during redo
    
    try {
      const state = historyManager.redo(); 
      if (state) {
        // restoreCanvas handles the async delay (up to 300ms timeout)
        await restoreCanvas(canvas as AnnotationCanvas, state);
        // Use deferred render for optimized repaint
        deferredRender(canvas as AnnotationCanvas);
      }
    } catch (error) {
      console.error('[AnnotationLayer] Failed to redo:', error);
    } finally {
      // Release locks immediately after restoreCanvas completes
      // The await above already provides necessary timing protection
      undoRedoLockRef.current = false;
      blockHistorySavesRef.current = false;
    }
  }, [canvas, historyManager]);

  // Imperative API
  const handlers = useMemo<AnnotationLayerHandle>(() => ({
    snapshot: () => canvas ? serializeCanvas(canvas as AnnotationCanvas) : null,
    load: async (json) => { 
      if (canvas && json) {
        try {
          // Suppress any saves triggered during load
          if (historyManager) {
            historyManager.suppressNext();
          }
          await restoreCanvas(canvas as AnnotationCanvas, json);
          // Use deferred render for optimized repaint
          deferredRender(canvas as AnnotationCanvas, () => {
            // Save the loaded state as new starting point
            // Only save if this is NOT the initial load (handled by the initial save effect)
            // We rely on the initial save effect to handle the first save
          });
        } catch (error) {
          console.error('[AnnotationLayer] Failed to load canvas state:', error);
        }
      }
    },
    exportPNG: () => { 
      try { 
        return canvas ? canvas.toDataURL({ format: 'png', quality: 1 }) : ''; 
      } catch (error) {
        console.error('[AnnotationLayer] Failed to export PNG:', error);
        return ''; 
      } 
    },
    exportSVG: () => { 
      try { 
        return canvas ? canvas.toSVG() : ''; 
      } catch (error) {
        console.error('[AnnotationLayer] Failed to export SVG:', error);
        return ''; 
      } 
    },
    clear: () => { 
      if (!canvas || !historyManager) return; 
      canvas.clear(); 
      canvas.renderAll();
      // Clear history completely - this action cannot be undone
      historyManager.clear();
      // Save the empty state as the new baseline
      saveToHistoryImmediate();
    },
    undo: handleUndo,
    redo: handleRedo,
    getCanvas: () => canvas,
    exportHistory: () => {
      if (!historyManager) return null;
      return historyManager.export();
    },
    importHistory: (data) => {
      if (!historyManager || !data) return;
      historyManager.import(data);
      
      // Restore canvas to current state in history
      if (data.currentIndex >= 0 && data.currentIndex < data.history.length) {
        const currentState = data.history[data.currentIndex];
        if (canvas && currentState) {
          restoreCanvas(canvas as AnnotationCanvas, currentState)
            .then(() => {
              deferredRender(canvas as AnnotationCanvas);
            })
            .catch((error) => {
              console.error('[AnnotationLayer] Failed to restore canvas after history import:', error);
            });
        }
      }
    }
  }), [canvas, historyManager, saveToHistoryImmediate, handleUndo, handleRedo]);

  useImperativeHandle(ref, () => handlers, [handlers]);

  // Mouse handlers
  const handleMouseDown = useCallback((e?: FabricEvent) => { if (!canvas) return; createMouseDownHandler(canvas, activeTool, setDrawingState)(e); }, [canvas, activeTool, setDrawingState]);
  const handleMouseMove = useCallback((e?: FabricEvent) => { if (!canvas) return; createMouseMoveHandler(canvas, activeTool, drawingState)(e); }, [canvas, activeTool, drawingState]);
  const handleMouseUp = useCallback(() => { createMouseUpHandler(drawingState, setDrawingState, saveToHistory, onFinish)(); }, [drawingState, setDrawingState, saveToHistory, onFinish]);

  // Object modify history - only save on modifications, not on initial add
  // Initial add is handled by mouseUp handler to avoid duplicate saves
  useEffect(() => {
    if (!canvas) return;
    const relevant = (t?: string) => !!t && ['rect','circle','path'].includes(t);
    
    // Only track modifications (move, resize, rotate) - not initial creation
    const modified = (e?: import('./types').FabricEvent) => { 
      if (relevant(e?.target?.type)) {
        saveToHistory(); 
      }
    };
    
    canvas.on('object:modified', modified);
    return () => { 
      canvas.off('object:modified', modified); 
    };
  }, [canvas, saveToHistory]);

  // Freedraw path creation history
  // CRITICAL: Freedraw uses isDrawingMode and creates paths automatically
  // We need to listen for path:created event to save freedraw to history
  // Use immediate save (not debounced) to ensure path is captured before undo/redo
  useEffect(() => {
    if (!canvas) return;
    
    const pathCreated = (e?: unknown) => {
      // Fabric.js path:created event includes the created path
      if (e && typeof e === 'object' && 'path' in e && e.path) {
        // Save immediately after path is created (freedraw complete)
        // Use immediate save to avoid race conditions with undo/redo
        saveToHistoryImmediate();
      }
    };
    
    (canvas as unknown as { on: (event: string, handler: (e?: unknown) => void) => void }).on('path:created', pathCreated);
    return () => {
      (canvas as unknown as { off: (event: string, handler: (e?: unknown) => void) => void }).off('path:created', pathCreated);
    };
  }, [canvas, saveToHistoryImmediate]);

  // Keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (!canvas) return; createKeyDownHandler(canvas, activeTool, handlers.undo, handlers.redo)(e); }, [canvas, activeTool, handlers.undo, handlers.redo]);
  useEffect(() => { const wrap = (e: KeyboardEvent) => { if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName||'')) return; handleKeyDown(e); }; document.addEventListener('keydown', wrap); return () => document.removeEventListener('keydown', wrap); }, [handleKeyDown]);

  // Init
  useEffect(() => { try { initializeCanvas(); setIsReady(true); } catch(e){ setInitError(e instanceof Error ? e.message : 'Failed to initialize canvas'); } return cleanup; }, [initializeCanvas, cleanup]);

  // Core canvas events
  useEffect(() => {
    if (!canvas || initError) return;
    
    updateCanvasMode(canvas, activeTool);
    
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    
    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, initError, activeTool, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Load initial state if provided
  useEffect(() => { 
    if (canvas && initialJSON && !initError && isReady) {
      handlers.load(initialJSON).catch(console.error);
    }
  }, [canvas, initialJSON, initError, isReady, handlers]);

  // React to theme changes (Tailwind dark class or system preference)
  useEffect(() => {
    if (!canvas) return;
    // Apply immediately on mount (in case theme differs from default)
    applyThemeColors(canvas);

    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    // Observer for class changes (tailwind dark mode toggling adds/removes 'dark')
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          applyThemeColors(canvas);
          break;
        }
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    // Media query listener for system theme changes when user preference is 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const mqHandler = () => applyThemeColors(canvas);
    mq.addEventListener?.('change', mqHandler);

    return () => {
      observer.disconnect();
      mq.removeEventListener?.('change', mqHandler);
    };
  }, [canvas]);

  // Save initial history snapshot AFTER canvas is ready and initial state loaded
  // This ensures we capture the correct starting state
  useEffect(() => { 
    if (!canvas || !isReady || initError || initialHistorySavedRef.current) return;
    
    // Save initial state immediately to establish history baseline
    // This is critical for redo to work after complete undo
    saveToHistoryImmediate();
    initialHistorySavedRef.current = true;
  }, [canvas, isReady, initError, saveToHistoryImmediate]);

  const retry = useCallback(() => { setInitError(null); try { initializeCanvas(); setIsReady(true);} catch(e){ setInitError(e instanceof Error ? e.message : 'Retry failed'); } }, [initializeCanvas]);

  return {
    state: { initError, isReady, containerRef, canvasRef },
    api: { retry, handlers }
  } as const;
}

export default useAnnotationInternal;
