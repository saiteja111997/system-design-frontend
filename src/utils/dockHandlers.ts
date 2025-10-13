import { CanvasControlsHook } from "@/hooks/useCanvasControls";

export interface DockItemHandlers {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleFullscreen: () => void;
}

export const createDockItemHandlers = (
  canvasControls: CanvasControlsHook,
  fullscreenHandlers?: {
    toggleFullscreen: () => void;
  }
): DockItemHandlers => {
  const { zoomIn, zoomOut, resetZoom } = canvasControls;

  return {
    handleZoomIn: zoomIn,
    handleZoomOut: zoomOut,
    handleResetZoom: resetZoom,
    handleFullscreen: fullscreenHandlers?.toggleFullscreen || (() => {}),
  };
};

export const handleDockItemClick = (
  itemId: string,
  handlers: DockItemHandlers
): void => {
  switch (itemId) {
    case "zoom-in":
      handlers.handleZoomIn();
      break;
    case "zoom-out":
      handlers.handleZoomOut();
      break;
    case "fullscreen":
      handlers.handleFullscreen();
      break;
    default:
      // Handle other dock items here
      console.log(`Clicked dock item: ${itemId}`);
      break;
  }
};
