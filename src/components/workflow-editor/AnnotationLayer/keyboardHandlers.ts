/**
 * Keyboard event handlers for annotation layer
 */

import type { FabricCanvas, FabricObject, Tool } from './types';

/**
 * Keyboard event handler for shortcuts
 */
export function createKeyDownHandler(
  canvas: FabricCanvas,
  activeTool: Tool,
  undo: () => void,
  redo: () => void,
  onToolChange?: (tool: Tool) => void
) {
  return (e: KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.key === 'Escape') {
      handleEscapeKey(canvas);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDeleteKey(canvas);
    } else if (e.ctrlKey || e.metaKey) {
      handleCtrlShortcuts(e, undo, redo);
    } else if (e.key >= '1' && e.key <= '4') {
      handleToolShortcuts(e.key, onToolChange);
    }
  };
}

/**
 * Handle escape key - deselect all objects
 */
function handleEscapeKey(canvas: FabricCanvas): void {
  canvas.discardActiveObject();
  canvas.renderAll();
}

/**
 * Handle delete key - remove selected objects
 */
function handleDeleteKey(canvas: FabricCanvas): void {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  activeObjects.forEach((obj: FabricObject) => {
    canvas.remove(obj);
  });
  
  canvas.discardActiveObject();
  canvas.renderAll();
}

/**
 * Handle Ctrl/Cmd shortcuts (undo/redo)
 */
function handleCtrlShortcuts(
  e: KeyboardEvent,
  undo: () => void,
  redo: () => void
): void {
  if (e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
    e.preventDefault();
    redo();
  }
}

/**
 * Handle tool shortcuts (1-4 keys)
 */
function handleToolShortcuts(
  key: string,
  onToolChange?: (tool: Tool) => void
): void {
  if (!onToolChange) return;

  const toolMap: Record<string, Tool> = {
    '1': 'select',
    '2': 'rectangle', 
    '3': 'circle',
    '4': 'freedraw'
  };

  const tool = toolMap[key];
  if (tool) {
    onToolChange(tool);
  }
}