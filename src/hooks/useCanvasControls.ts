/**
 * Canvas controls hook for zoom, pan, and transform operations
 * Manages canvas viewport state with persistent storage via Zustand
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { CanvasTransform, CanvasControlsHook } from "@/types/canvas";

// ============================================================================
// CONSTANTS
// ============================================================================

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

// Interactive elements that should not trigger panning
const INTERACTIVE_SELECTORS =
  ".workflow-node, .dock-navigation, .workflow-header";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two touch points for pinch gestures
 */
const getTouchDistance = (touches: React.TouchList): number => {
  if (touches.length < 2) return 0;

  const touch1 = touches[0];
  const touch2 = touches[1];

  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

/**
 * Check if event target is an interactive element that should not trigger panning
 */
const isInteractiveElement = (target: HTMLElement): boolean => {
  return Boolean(target.closest(INTERACTIVE_SELECTORS));
};

/**
 * Detect if wheel event is a pinch gesture
 */
const isPinchGesture = (event: WheelEvent | React.WheelEvent): boolean => {
  return (
    event.ctrlKey ||
    event.metaKey ||
    (Math.abs(event.deltaY) < 50 && event.ctrlKey) ||
    (Math.abs(event.deltaY) < 10 &&
      Math.abs(event.deltaX) > Math.abs(event.deltaY))
  );
};

/**
 * Constrain scale value within min/max bounds
 */
const constrainScale = (scale: number): number => {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useCanvasControls = (): CanvasControlsHook => {
  // ========================================
  // STATE & REFS
  // ========================================

  // Zustand store state
  const transform = useWorkflowStore((state) => state.canvasTransform);
  const setCanvasTransform = useWorkflowStore(
    (state) => state.setCanvasTransform
  );
  const updateCanvasTransform = useWorkflowStore(
    (state) => state.updateCanvasTransform
  );

  // Local interaction state
  const [isDragging, setIsDragging] = useState(false);

  // Mouse/drag tracking refs
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartTransform = useRef<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Touch/pinch tracking refs
  const initialTouchDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);
  const touchStartTransform = useRef<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // ========================================
  // ZOOM CONTROLS
  // ========================================

  const zoomIn = useCallback(() => {
    const newScale = constrainScale(transform.scale + ZOOM_STEP);
    updateCanvasTransform({ scale: newScale });
  }, [transform.scale, updateCanvasTransform]);

  const zoomOut = useCallback(() => {
    const newScale = constrainScale(transform.scale - ZOOM_STEP);
    updateCanvasTransform({ scale: newScale });
  }, [transform.scale, updateCanvasTransform]);

  const setZoom = useCallback(
    (scale: number) => {
      const constrainedScale = constrainScale(scale);
      updateCanvasTransform({ scale: constrainedScale });
    },
    [updateCanvasTransform]
  );

  const resetZoom = useCallback(() => {
    setCanvasTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, [setCanvasTransform]);

  // ========================================
  // MOUSE PAN HANDLERS
  // ========================================

  const handlePanStart = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      // Skip panning for interactive elements
      if (isInteractiveElement(target)) return;

      setIsDragging(true);
      lastMousePos.current = { x: event.clientX, y: event.clientY };
      dragStartTransform.current = { ...transform };

      // Prevent text selection during drag
      event.preventDefault();
    },
    [transform]
  );

  const handlePanMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - lastMousePos.current.x;
      const deltaY = event.clientY - lastMousePos.current.y;

      setCanvasTransform({
        ...transform,
        translateX: dragStartTransform.current.translateX + deltaX,
        translateY: dragStartTransform.current.translateY + deltaY,
      });
    },
    [isDragging, transform, setCanvasTransform]
  );

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ========================================
  // TOUCH HANDLERS
  // ========================================

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const target = event.target as HTMLElement;

      // Skip touch for interactive elements
      if (isInteractiveElement(target)) return;

      if (event.touches.length === 2) {
        // Two-finger pinch start
        event.preventDefault();
        initialTouchDistance.current = getTouchDistance(event.touches);
        initialScale.current = transform.scale;
        touchStartTransform.current = { ...transform };
      } else if (event.touches.length === 1) {
        // Single finger pan start
        const touch = event.touches[0];
        setIsDragging(true);
        lastMousePos.current = { x: touch.clientX, y: touch.clientY };
        dragStartTransform.current = { ...transform };
        event.preventDefault();
      }
    },
    [transform]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 2) {
        // Two-finger pinch move
        event.preventDefault();
        const currentDistance = getTouchDistance(event.touches);

        if (initialTouchDistance.current > 0) {
          const scale =
            initialScale.current *
            (currentDistance / initialTouchDistance.current);
          const constrainedScale = constrainScale(scale);

          updateCanvasTransform({ scale: constrainedScale });
        }
      } else if (event.touches.length === 1 && isDragging) {
        // Single finger pan move
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastMousePos.current.x;
        const deltaY = touch.clientY - lastMousePos.current.y;

        setCanvasTransform({
          ...transform,
          translateX: dragStartTransform.current.translateX + deltaX,
          translateY: dragStartTransform.current.translateY + deltaY,
        });
      }
    },
    [isDragging, transform, setCanvasTransform, updateCanvasTransform]
  );

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 0) {
      // All fingers lifted
      setIsDragging(false);
      initialTouchDistance.current = 0;
      initialScale.current = 1;
    } else if (event.touches.length === 1) {
      // One finger remaining, reset pinch state
      initialTouchDistance.current = 0;
      initialScale.current = 1;
    }
  }, []);

  // ========================================
  // WHEEL HANDLER (Trackpad)
  // ========================================

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (!isPinchGesture(event)) return;

      // Prevent all default behaviors for pinch gestures
      event.preventDefault();
      event.stopPropagation();

      // Calculate zoom change
      const delta = -event.deltaY;
      const scaleFactor = Math.abs(delta) > 100 ? ZOOM_STEP * 2 : ZOOM_STEP;
      const zoomFactor = delta > 0 ? scaleFactor : -scaleFactor;
      const newScale = constrainScale(transform.scale + zoomFactor);

      // UI zoom should update workflow transform only (not annotation)
      updateCanvasTransform({ scale: newScale });

      return false;
    },
    [transform.scale, updateCanvasTransform]
  );

  // ========================================
  // STYLE GENERATOR
  // ========================================

  const getCanvasTransformStyle = useCallback(
    (): React.CSSProperties => ({
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: "center center",
      transition: isDragging ? "none" : "transform 0.2s ease-out",
    }),
    [transform, isDragging]
  );

  // ========================================
  // GLOBAL EVENT LISTENERS
  // ========================================

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handlePanEnd();
      }
    };

    const handleGlobalWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement;
      const canvasElement = target.closest('[data-canvas-area="true"]');

      if (canvasElement && isPinchGesture(event)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    // Add event listeners
    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("wheel", handleGlobalWheel);
    };
  }, [isDragging, handlePanEnd]);

  // ========================================
  // PUBLIC API
  // ========================================

  return {
    // State
    transform,
    isDragging,

    // Zoom controls
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,

    // Pan handlers
    handlePanStart,
    handlePanMove,
    handlePanEnd,

    // Touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Wheel handler
    handleWheel,

    // Style generator
    getCanvasTransformStyle,
  };
};
