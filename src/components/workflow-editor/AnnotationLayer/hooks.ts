/**
 * Custom hooks for annotation layer functionality
 */

import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { 
  serializeCanvas, 
  HistoryManager, 
  debounce,
  calculateResizeScale,
  setCanvasSize
} from '../../../utils/annotationUtils';
import { 
  initializeFabricCanvas, 
  scaleCanvasObjects,
  disposeCanvas 
} from './canvasOperations';
import type { 
  FabricCanvas, 
  DrawingState
} from './types';

/**
 * Hook for managing canvas initialization and lifecycle
 */
export function useCanvasSetup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const fabricCanvas = initializeFabricCanvas(canvasRef.current, rect);
    
    fabricCanvasRef.current = fabricCanvas;
    setContainerSize({ width: rect.width, height: rect.height });
    setIsReady(true);
  }, []);

  const cleanup = useCallback(() => {
    disposeCanvas(fabricCanvasRef.current);
    fabricCanvasRef.current = null;
  }, []);

  return {
    canvasRef,
    containerRef,
    fabricCanvasRef,
    isReady,
    containerSize,
    setContainerSize,
    initializeCanvas,
    cleanup
  };
}

/**
 * Hook for managing drawing state
 */
export function useDrawingState() {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentShape: null
  });

  const resetDrawingState = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentShape: null
    });
  }, []);

  return {
    drawingState,
    setDrawingState,
    resetDrawingState
  };
}

/**
 * Hook for managing history and persistence
 */
export function useHistoryManager() {
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager(50));

  const saveToHistory = useMemo(
    () => debounce(() => {
      // This will be set by the consuming component
    }, 200),
    []
  );

  const createSaveToHistory = useCallback((canvas: FabricCanvas | null) => {
    return debounce(() => {
      if (canvas) {
        const state = serializeCanvas(canvas as unknown as import('../../../utils/annotationUtils').FabricCanvas);
        historyManagerRef.current.push(state);
      }
    }, 200);
  }, []);

  return {
    historyManagerRef,
    saveToHistory,
    createSaveToHistory
  };
}

/**
 * Hook for handling window resize
 */
export function useCanvasResize(
  fabricCanvasRef: React.RefObject<FabricCanvas | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerSize: { width: number; height: number },
  setContainerSize: (size: { width: number; height: number }) => void
) {
  const handleResize = useCallback(() => {
    if (!fabricCanvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newSize = { width: rect.width, height: rect.height };

    if (newSize.width === containerSize.width && newSize.height === containerSize.height) {
      return;
    }

    const canvas = fabricCanvasRef.current;
    const { scaleX, scaleY } = calculateResizeScale(containerSize, newSize);

    scaleCanvasObjects(canvas, scaleX, scaleY);

    canvas.setDimensions(newSize);
    if (canvasRef.current) {
      setCanvasSize(canvasRef.current, newSize.width, newSize.height);
    }

    setContainerSize(newSize);
    canvas.renderAll();
  }, [fabricCanvasRef, containerRef, canvasRef, containerSize, setContainerSize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return handleResize;
}