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

  // ResizeObserver to watch for container size changes due to dynamic scaling
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setupResizeObserver = useCallback(() => {
    if (!containerRef.current || !fabricCanvasRef.current || !canvasRef.current)
      return;

    // Clean up existing observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Create new ResizeObserver to watch container size changes
    resizeObserverRef.current = new ResizeObserver((entries) => {
      // Clear any pending resize to debounce
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce resize operations to avoid performance issues during rapid zoom changes
      resizeTimeoutRef.current = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;

          // Only resize if dimensions actually changed significantly (avoid micro-changes)
          const threshold = 1; // 1px threshold to avoid unnecessary updates
          const widthChanged =
            Math.abs(width - containerSize.width) > threshold;
          const heightChanged =
            Math.abs(height - containerSize.height) > threshold;

          if (widthChanged || heightChanged) {
            const newSize = { width, height };

            const canvas = fabricCanvasRef.current;
            if (canvas && canvasRef.current) {
              // Use requestAnimationFrame for smooth resize
              requestAnimationFrame(() => {
                try {
                  // Resize the Fabric.js canvas
                  canvas.setDimensions(newSize);

                  // Resize the underlying HTML canvas element
                  setCanvasSize(canvasRef.current!, width, height);

                  // Update our tracked container size
                  setContainerSize(newSize);

                  // Re-render the canvas
                  canvas.renderAll();
                } catch (error) {
                  console.warn(
                    "[AnnotationLayer] Error during canvas resize:",
                    error
                  );
                }
              });
            }
          }
        }
      }, 16); // ~60fps debounce (16ms)
    });

    // Start observing the container
    resizeObserverRef.current.observe(containerRef.current);
  }, [containerSize.width, containerSize.height]);

  // Setup ResizeObserver when canvas is ready
  useEffect(() => {
    if (isReady) {
      setupResizeObserver();
    }

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isReady, setupResizeObserver]);

  const cleanup = useCallback(() => {
    // Clean up resize timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }

    // Clean up ResizeObserver
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    // Clean up Fabric.js canvas
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
