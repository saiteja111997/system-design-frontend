/**
 * Canvas controls types for workflow editor
 */

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
  setZoom: (scale: number) => void;
  handlePanStart: (event: React.MouseEvent) => void;
  handlePanMove: (event: React.MouseEvent) => void;
  handlePanEnd: () => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
  handleWheel: (event: React.WheelEvent) => void;
  getTransformStyle: () => React.CSSProperties;
}
