import { useState, useCallback, useRef, useEffect } from "react";

export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface CanvasControlsHook {
  transform: CanvasTransform;
  isDragging: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  handlePanStart: (event: React.MouseEvent) => void;
  handlePanMove: (event: React.MouseEvent) => void;
  handlePanEnd: () => void;
  handleWheel: (event: React.WheelEvent) => void;
  getTransformStyle: () => React.CSSProperties;
}

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2.0;

export const useCanvasControls = (): CanvasControlsHook => {
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartTransform = useRef<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Zoom functions
  const zoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + ZOOM_STEP, MAX_ZOOM),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - ZOOM_STEP, MIN_ZOOM),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);

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

      setTransform((prev) => ({
        ...prev,
        translateX: dragStartTransform.current.translateX + deltaX,
        translateY: dragStartTransform.current.translateY + deltaY,
      }));
    },
    [isDragging]
  );

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom function
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();

    const delta = -event.deltaY;
    const zoomFactor = delta > 0 ? ZOOM_STEP : -ZOOM_STEP;

    setTransform((prev) => ({
      ...prev,
      scale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.scale + zoomFactor)),
    }));
  }, []);

  // Get CSS transform style
  const getTransformStyle = useCallback(
    (): React.CSSProperties => ({
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: "center center",
      transition: isDragging ? "none" : "transform 0.2s ease-out",
    }),
    [transform, isDragging]
  );

  // Global mouse up listener to handle mouse release outside canvas during panning
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Only end panning if we're actually dragging the canvas
      if (isDragging) {
        handlePanEnd();
      }
    };

    // Add global event listener
    document.addEventListener("mouseup", handleGlobalMouseUp);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handlePanEnd]);

  return {
    transform,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleWheel,
    getTransformStyle,
  };
};
