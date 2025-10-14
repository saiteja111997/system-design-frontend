import { CanvasControlsHook } from "@/hooks/useCanvasControls";
import type { Tool } from "@/components/workflow-editor/AnnotationLayer";

export interface DockItemHandlers {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleFullscreen: () => void;
  handleAnnotationTool: (tool: Tool) => void;
}

export const createDockItemHandlers = (
  canvasControls: CanvasControlsHook,
  fullscreenHandlers?: {
    toggleFullscreen: () => void;
  },
  annotationHandlers?: {
    setActiveTool: (tool: Tool) => void;
  }
): DockItemHandlers => {
  const { zoomIn, zoomOut, resetZoom } = canvasControls;

  return {
    handleZoomIn: zoomIn,
    handleZoomOut: zoomOut,
    handleResetZoom: resetZoom,
    handleFullscreen: fullscreenHandlers?.toggleFullscreen || (() => {}),
    handleAnnotationTool: annotationHandlers?.setActiveTool || (() => {}),
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
    // Annotation tools
    case "selection-tool":
      handlers.handleAnnotationTool("select");
      break;
    case "rectangle-tool":
      handlers.handleAnnotationTool("rectangle");
      break;
    case "ellipse-tool":
      handlers.handleAnnotationTool("circle");
      break;
    case "free-draw":
      handlers.handleAnnotationTool("freedraw");
      break;
    default:
      // Handle other dock items here
      console.log(`Clicked dock item: ${itemId}`);
      break;
  }
};
