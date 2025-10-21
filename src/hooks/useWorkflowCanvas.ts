/**
 * Main orchestrator hook for workflow canvas functionality
 * Combines all canvas-related hooks with optimized event handling
 */

import { useCallback, useMemo } from "react";
import { useNodeInteractions } from "./useNodeInteractions";
import { useCanvasCoordinates } from "./useCanvasCoordinates";
import { useCanvasViewport } from "./useCanvasViewport";
import { useCanvasTools } from "./useCanvasTools";

interface UseWorkflowCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const useWorkflowCanvas = ({ canvasRef }: UseWorkflowCanvasProps) => {
  // Initialize coordinate system
  const coordinates = useCanvasCoordinates({ canvasRef });

  // Initialize viewport controls
  const viewport = useCanvasViewport();

  // Initialize tool management
  const tools = useCanvasTools();

  // Initialize node interactions with coordinate system
  const nodeInteractions = useNodeInteractions({
    getCanvasCoordinates: coordinates.getCanvasCoordinates,
  });

  // Unified mouse move handler that delegates to appropriate handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Handle viewport panning
      viewport.handlePanMove(e);

      // Handle node dragging
      nodeInteractions.handleNodeDrag(e);

      // Handle connection dragging
      nodeInteractions.handleConnectionDrag(e);
    },
    [viewport, nodeInteractions]
  );

  // Unified mouse up handler
  const handleMouseUp = useCallback(() => {
    // End viewport panning
    viewport.handlePanEnd();

    // End node dragging
    nodeInteractions.handleNodeDragEnd();

    // Cancel any active connections
    nodeInteractions.handleConnectionCancel();

    // Stop any drawing operations
    tools.stopDrawing();
  }, [viewport, nodeInteractions, tools]);

  // Unified mouse down handler for canvas background
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Start panning if no tool is actively drawing
      if (!tools.isDrawing) {
        viewport.handlePanStart(e);
      }
    },
    [viewport, tools.isDrawing]
  );

  // Touch handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      viewport.handleTouchStart(e);
    },
    [viewport]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      viewport.handleTouchMove(e);
    },
    [viewport]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      viewport.handleTouchEnd(e);
    },
    [viewport]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              tools.executeAction("redo");
            } else {
              tools.executeAction("undo");
            }
            break;
          case "=":
          case "+":
            e.preventDefault();
            viewport.zoomIn();
            break;
          case "-":
            e.preventDefault();
            viewport.zoomOut();
            break;
          case "0":
            e.preventDefault();
            viewport.resetViewport();
            break;
          default:
            break;
        }
      }

      // Tool shortcuts
      switch (e.key) {
        case "v":
          tools.setActiveTool("selection-tool");
          break;
        case "r":
          tools.setActiveTool("rectangle-tool");
          break;
        case "o":
          tools.setActiveTool("ellipse-tool");
          break;
        case "p":
          tools.setActiveTool("free-draw");
          break;
        case "t":
          tools.setActiveTool("text");
          break;
        case "Escape":
          tools.setActiveTool("selection-tool");
          nodeInteractions.handleConnectionCancel();
          break;
        default:
          break;
      }
    },
    [tools, viewport, nodeInteractions]
  );

  // Canvas style with cursor
  const canvasStyle = useMemo(
    () => ({
      ...viewport.getCanvasTransformStyle(),
      cursor: tools.getCursorStyle(),
    }),
    [viewport, tools]
  );

  // Combined event handlers for easy component integration
  const canvasEventHandlers = useMemo(
    () => ({
      onMouseDown: handleCanvasMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onWheel: viewport.handleWheel,
      onKeyDown: handleKeyDown,
      tabIndex: 0, // Enable keyboard events
    }),
    [
      handleCanvasMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      viewport.handleWheel,
      handleKeyDown,
    ]
  );

  return {
    // Sub-hooks for granular access
    coordinates,
    viewport,
    tools,
    nodeInteractions,

    // Unified event handlers
    canvasEventHandlers,
    canvasStyle,

    // Convenience methods
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
  };
};
