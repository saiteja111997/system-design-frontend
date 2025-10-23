/**
 * Custom hooks for annotation layer functionality
 */

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import {
  serializeCanvas,
  HistoryManager,
  debounce,
  calculateResizeScale,
  setCanvasSize,
} from "../../../../utils/annotationUtils";
import type { FabricCanvas as UtilsFabricCanvas } from "../../../../utils/annotationUtils";
import {
  initializeFabricCanvas,
  scaleCanvasObjects,
  disposeCanvas,
} from "./canvasOperations";
import type { FabricCanvas, DrawingState } from "./types";

/**
 * Type guard to check if canvas has required serialization methods
 */
function isSerializableCanvas(canvas: unknown): canvas is UtilsFabricCanvas {
  return (
    typeof canvas === "object" &&
    canvas !== null &&
    typeof (canvas as Record<string, unknown>).toJSON === "function" &&
    typeof (canvas as Record<string, unknown>).getWidth === "function" &&
    typeof (canvas as Record<string, unknown>).getHeight === "function"
  );
}

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
    cleanup,
  };
}

/**
 * Hook for managing drawing state
 */
export function useDrawingState() {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentShape: null,
  });

  const resetDrawingState = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentShape: null,
    });
  }, []);

  return {
    drawingState,
    setDrawingState,
    resetDrawingState,
  };
}

/**
 * Hook for managing history and persistence
 * Returns a stable debounced save function that can be flushed on demand
 */
export function useHistoryManager(
  canvas: FabricCanvas | null,
  blockSavesRef?: React.RefObject<boolean>
) {
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager(50));

  // Flag to track if we need to flush pending saves
  const hasPendingSaveRef = useRef(false);

  /**
   * Create a stable, memoized save function that properly captures canvas state
   * This function is debounced to avoid excessive history snapshots during rapid changes
   */
  const saveToHistory = useCallback(() => {
    if (!canvas) return;

    // Check if saves are blocked (during undo/redo operations)
    if (blockSavesRef?.current) {
      console.log(
        "[AnnotationLayer] History save blocked during undo/redo operation"
      );
      return;
    }

    // Verify canvas is serializable before attempting to save
    if (!isSerializableCanvas(canvas)) {
      console.error(
        "[AnnotationLayer] Canvas does not support serialization methods. Skipping history save."
      );
      return;
    }

    try {
      const state = serializeCanvas(canvas);
      historyManagerRef.current.push(state);
    } catch (error) {
      console.error("[AnnotationLayer] Failed to save history:", error);
    } finally {
      hasPendingSaveRef.current = false;
    }
  }, [canvas, blockSavesRef]);

  /**
   * Create debounced version for high-frequency operations (drawing, dragging)
   * Separate from immediate save for explicit operations (clear, undo/redo)
   */
  const debouncedSave = useMemo(() => {
    return debounce(() => {
      saveToHistory();
    }, 200);
  }, [saveToHistory]);

  /**
   * Wrapper that tracks pending saves
   */
  const saveToHistoryDebounced = useCallback(() => {
    hasPendingSaveRef.current = true;
    debouncedSave();
  }, [debouncedSave]);

  /**
   * Immediate save without debounce for explicit user actions
   */
  const saveToHistoryImmediate = useCallback(() => {
    // Reset pending flag and save immediately
    hasPendingSaveRef.current = false;
    saveToHistory();
  }, [saveToHistory]);

  /**
   * Cleanup: flush pending saves on unmount to prevent data loss
   */
  useEffect(() => {
    return () => {
      // If there's a pending save, execute it immediately
      if (hasPendingSaveRef.current) {
        try {
          saveToHistory();
        } catch (error) {
          console.warn(
            "[AnnotationLayer] Failed to flush history on cleanup:",
            error
          );
        }
      }
    };
  }, [saveToHistory]);

  return {
    historyManagerRef,
    saveToHistory: saveToHistoryDebounced,
    saveToHistoryImmediate,
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

    if (
      newSize.width === containerSize.width &&
      newSize.height === containerSize.height
    ) {
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
  }, [
    fabricCanvasRef,
    containerRef,
    canvasRef,
    containerSize,
    setContainerSize,
  ]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return handleResize;
}
