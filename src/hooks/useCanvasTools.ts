/**
 * Canvas tool management hook for handling different drawing/editing tools
 * Manages tool state and provides unified interface for tool interactions
 */

import { useCallback, useState } from "react";

export type CanvasTool =
  | "selection-tool"
  | "rectangle-tool"
  | "ellipse-tool"
  | "free-draw"
  | "arrow"
  | "line"
  | "text"
  | "comment";

export type CanvasAction = "undo" | "redo" | "clear-all" | "fullscreen";

interface ToolSettings {
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
}

interface UseCanvasToolsState {
  activeTool: CanvasTool;
  isDrawing: boolean;
  toolSettings: Record<string, ToolSettings>;
}

export const useCanvasTools = () => {
  const [state, setState] = useState<UseCanvasToolsState>({
    activeTool: "selection-tool",
    isDrawing: false,
    toolSettings: {},
  });

  // Tool selection
  const setActiveTool = useCallback((tool: CanvasTool) => {
    setState((prev) => ({
      ...prev,
      activeTool: tool,
      isDrawing: false, // Reset drawing state when switching tools
    }));
  }, []);

  // Drawing state management
  const startDrawing = useCallback(() => {
    setState((prev) => ({ ...prev, isDrawing: true }));
  }, []);

  const stopDrawing = useCallback(() => {
    setState((prev) => ({ ...prev, isDrawing: false }));
  }, []);

  // Tool settings management
  const updateToolSettings = useCallback(
    (tool: CanvasTool, settings: ToolSettings) => {
      setState((prev) => ({
        ...prev,
        toolSettings: {
          ...prev.toolSettings,
          [tool]: { ...prev.toolSettings[tool], ...settings },
        },
      }));
    },
    []
  );

  // Get settings for specific tool
  const getToolSettings = useCallback(
    (tool: CanvasTool) => {
      return state.toolSettings[tool] || {};
    },
    [state.toolSettings]
  );

  // Handle tool actions
  const executeAction = useCallback((action: CanvasAction) => {
    switch (action) {
      case "undo":
        // Implement undo logic
        console.log("Undo action");
        break;
      case "redo":
        // Implement redo logic
        console.log("Redo action");
        break;
      case "clear-all":
        // Implement clear all logic
        console.log("Clear all action");
        break;
      case "fullscreen":
        // Implement fullscreen logic
        console.log("Fullscreen action");
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }, []);

  // Check if tool is active
  const isToolActive = useCallback(
    (tool: CanvasTool) => {
      return state.activeTool === tool;
    },
    [state.activeTool]
  );

  // Get cursor style for active tool
  const getCursorStyle = useCallback(() => {
    const cursorMap: Record<CanvasTool, string> = {
      "selection-tool": "default",
      "rectangle-tool": "crosshair",
      "ellipse-tool": "crosshair",
      "free-draw": "url('/cursors/pen.cur'), auto",
      arrow: "crosshair",
      line: "crosshair",
      text: "text",
      comment: "pointer",
    };

    return cursorMap[state.activeTool] || "default";
  }, [state.activeTool]);

  return {
    // State
    activeTool: state.activeTool,
    isDrawing: state.isDrawing,

    // Tool management
    setActiveTool,
    isToolActive,
    getCursorStyle,

    // Drawing state
    startDrawing,
    stopDrawing,

    // Settings management
    updateToolSettings,
    getToolSettings,

    // Actions
    executeAction,
  };
};
