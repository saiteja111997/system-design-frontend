/**
 * Zustand-based canvas controls that persist zoom and pan state
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { CanvasTransform, CanvasControlsHook } from "@/types/canvas";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

// Helper function to get distance between two touch points
const getTouchDistance = (touches: React.TouchList): number => {
  if (touches.length < 2) return 0;
  const touch1 = touches[0];
  const touch2 = touches[1];
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

export const useCanvasControls = (): CanvasControlsHook => {
  // Get transform from Zustand store
  const transform = useWorkflowStore((state) => state.canvasTransform);
  const setCanvasTransform = useWorkflowStore(
    (state) => state.setCanvasTransform
  );
  const updateCanvasTransform = useWorkflowStore(
    (state) => state.updateCanvasTransform
  );

  // Local state for drag interactions
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartTransform = useRef<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Touch/pinch state
  const initialTouchDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);
  const touchStartTransform = useRef<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Zoom functions
  const zoomIn = useCallback(() => {
    updateCanvasTransform({
      scale: Math.min(transform.scale + ZOOM_STEP, MAX_ZOOM),
    });
  }, [transform.scale, updateCanvasTransform]);

  const zoomOut = useCallback(() => {
    updateCanvasTransform({
      scale: Math.max(transform.scale - ZOOM_STEP, MIN_ZOOM),
    });
  }, [transform.scale, updateCanvasTransform]);

  const resetZoom = useCallback(() => {
    setCanvasTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, [setCanvasTransform]);

  const setZoom = useCallback(
    (scale: number) => {
      const constrainedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
      updateCanvasTransform({ scale: constrainedScale });
    },
    [updateCanvasTransform]
  );

  // Pan functions
  const handlePanStart = useCallback(
    (event: React.MouseEvent) => {
      // Only start panning if not clicking on a node or other interactive element
      const target = event.target as HTMLElement;
      const isInteractiveElement = target.closest(
        ".workflow-node, .dock-navigation, .workflow-header"
      );

      if (isInteractiveElement) return;

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

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const target = event.target as HTMLElement;
      const isInteractiveElement = target.closest(
        ".workflow-node, .dock-navigation, .workflow-header"
      );

      if (isInteractiveElement) return;

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
          const constrainedScale = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, scale)
          );

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
      // One finger remaining, reset pinch state but continue pan if was dragging
      initialTouchDistance.current = 0;
      initialScale.current = 1;
    }
  }, []);

  // Wheel handler for trackpad pinch gestures
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      // Comprehensive pinch gesture detection
      const isPinchGesture =
        event.ctrlKey ||
        event.metaKey ||
        (Math.abs(event.deltaY) < 50 && event.ctrlKey) ||
        (Math.abs(event.deltaY) < 10 &&
          Math.abs(event.deltaX) > Math.abs(event.deltaY));

      if (isPinchGesture) {
        // CRITICAL: Prevent ALL default behaviors for pinch gestures
        event.preventDefault();
        event.stopPropagation();

        // Calculate zoom only if within bounds, but always prevent webpage zoom
        const delta = -event.deltaY;
        const scaleFactor = Math.abs(delta) > 100 ? ZOOM_STEP * 2 : ZOOM_STEP;
        const zoomFactor = delta > 0 ? scaleFactor : -scaleFactor;

        const newScale = transform.scale + zoomFactor;
        const constrainedScale = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, newScale)
        );

        updateCanvasTransform({ scale: constrainedScale });

        // Return false to ensure no further event processing
        return false;
      }
      // If it's not a pinch gesture, do nothing (allow normal scrolling)
    },
    [transform.scale, updateCanvasTransform]
  );

  // Get CSS transform style
  const getTransformStyle = useCallback(
    (): React.CSSProperties => ({
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: "center center",
      transition: isDragging ? "none" : "transform 0.2s ease-out",
    }),
    [transform, isDragging]
  );

  // Global mouse up listener and pinch gesture prevention
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Only end panning if we're actually dragging the canvas
      if (isDragging) {
        handlePanEnd();
      }
    };

    // Global wheel listener to catch any pinch gestures that might bubble up
    const handleGlobalWheel = (event: WheelEvent) => {
      // Check if the target is within the canvas area
      const target = event.target as HTMLElement;
      const canvasElement = target.closest('[data-canvas-area="true"]');

      if (canvasElement) {
        const isPinchGesture =
          event.ctrlKey ||
          event.metaKey ||
          (Math.abs(event.deltaY) < 10 &&
            Math.abs(event.deltaX) > Math.abs(event.deltaY));

        if (isPinchGesture) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      }
    };

    // Add global event listeners
    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("wheel", handleGlobalWheel);
    };
  }, [isDragging, handlePanEnd]);

  return {
    transform,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    getTransformStyle,
  };
};
