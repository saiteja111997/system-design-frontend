"use client";
import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useCanvasSetup, useDrawingState, useHistoryManager } from './hooks';
import { createMouseDownHandler, createMouseMoveHandler, createMouseUpHandler } from './mouseHandlers';
import { createKeyDownHandler } from './keyboardHandlers';
import { updateCanvasMode, applyThemeColors } from './canvasOperations';
import { serializeCanvas, restoreCanvas } from '../../../utils/annotationUtils';
import type { AnnotationLayerProps, AnnotationLayerHandle, FabricEvent } from './types';

// Type alias for cleaner canvas casting
type AnnotationCanvas = import('../../../utils/annotationUtils').FabricCanvas;

export function useAnnotationInternal(props: AnnotationLayerProps, ref: React.Ref<AnnotationLayerHandle>) {
  const { activeTool, onFinish, initialJSON } = props;
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { canvasRef, fabricCanvasRef, containerRef, initializeCanvas, cleanup } = useCanvasSetup();
  const { drawingState, setDrawingState } = useDrawingState();
  const { historyManagerRef, createSaveToHistory } = useHistoryManager();

  const canvas = fabricCanvasRef.current;
  const historyManager = historyManagerRef.current;
  const saveToHistory = createSaveToHistory(canvas);

  // Imperative API
  const handlers = useMemo<AnnotationLayerHandle>(() => ({
    snapshot: () => canvas ? serializeCanvas(canvas as AnnotationCanvas) : null,
    load: async (json) => { 
      if (canvas && json) {
        try {
          await restoreCanvas(canvas as AnnotationCanvas, json);
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
    clear: () => { if (!canvas) return; canvas.clear(); canvas.renderAll(); saveToHistory(); },
    undo: () => { 
      const state = historyManager.undo(); 
      if (state && canvas) {
        restoreCanvas(canvas as AnnotationCanvas, state).catch((error) => 
          console.error('[AnnotationLayer] Failed to undo:', error)
        );
      }
    },
    redo: () => { 
      const state = historyManager.redo(); 
      if (state && canvas) {
        restoreCanvas(canvas as AnnotationCanvas, state).catch((error) => 
          console.error('[AnnotationLayer] Failed to redo:', error)
        );
      }
    },
    getCanvas: () => canvas
  }), [canvas, historyManager, saveToHistory]);

  useImperativeHandle(ref, () => handlers, [handlers]);

  // Mouse handlers
  const handleMouseDown = useCallback((e?: FabricEvent) => { if (!canvas) return; createMouseDownHandler(canvas, activeTool, setDrawingState)(e); }, [canvas, activeTool, setDrawingState]);
  const handleMouseMove = useCallback((e?: FabricEvent) => { if (!canvas) return; createMouseMoveHandler(canvas, activeTool, drawingState)(e); }, [canvas, activeTool, drawingState]);
  const handleMouseUp = useCallback(() => { createMouseUpHandler(drawingState, setDrawingState, saveToHistory, onFinish)(); }, [drawingState, setDrawingState, saveToHistory, onFinish]);

  // Object add/modify history
  useEffect(() => {
    if (!canvas) return;
    const relevant = (t?: string) => !!t && ['rect','circle','path'].includes(t);
  const added = (e?: import('./types').FabricEvent) => { if (relevant(e?.target?.type)) saveToHistory(); };
  const modified = (e?: import('./types').FabricEvent) => { if (relevant(e?.target?.type)) saveToHistory(); };
    canvas.on('object:added', added); canvas.on('object:modified', modified);
    return () => { canvas.off('object:added', added); canvas.off('object:modified', modified); };
  }, [canvas, saveToHistory]);

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

  // Load initial
  useEffect(() => { if(canvas && initialJSON && !initError){ handlers.load(initialJSON).catch(console.error);} }, [canvas, initialJSON, initError, handlers]);

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

  // Initial history snapshot
  useEffect(() => { if(canvas && isReady && !initError){ try { saveToHistory(); } catch {} } }, [canvas, isReady, initError, saveToHistory]);

  const retry = useCallback(() => { setInitError(null); try { initializeCanvas(); setIsReady(true);} catch(e){ setInitError(e instanceof Error ? e.message : 'Retry failed'); } }, [initializeCanvas]);

  return {
    state: { initError, isReady, containerRef, canvasRef },
    api: { retry, handlers }
  } as const;
}

export default useAnnotationInternal;
