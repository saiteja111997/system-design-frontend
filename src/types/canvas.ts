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
  isPanning: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (scale: number) => void;
  resetViewport: () => void;
  zoomToFit: (bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  handlePanStart: (event: React.MouseEvent) => void;
  handlePanMove: (event: React.MouseEvent) => void;
  handlePanEnd: () => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
  handleWheel: (event: React.WheelEvent) => void;
  getCanvasTransformStyle: () => React.CSSProperties;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
}
