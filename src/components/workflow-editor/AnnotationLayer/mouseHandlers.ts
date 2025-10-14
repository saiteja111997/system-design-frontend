/**
 * Mouse event handlers for drawing operations
 */

import { normalizeRectangle } from '../../../utils/annotationUtils';
import { createRectangle, createCircle, finalizeShape } from './canvasOperations';
import type { 
  FabricCanvas, 
  FabricObject, 
  FabricEvent, 
  DrawingState, 
  Tool 
} from './types';

/**
 * Mouse down event handler for drawing operations
 */
export function createMouseDownHandler(
  canvas: FabricCanvas,
  activeTool: Tool,
  setDrawingState: (state: DrawingState | ((prev: DrawingState) => DrawingState)) => void
) {
  return (e?: FabricEvent<Event>) => {
    if (!e || !activeTool || activeTool === 'select') return;

    const pointer = canvas.getPointer(e.e);
    setDrawingState({
      isDrawing: true,
      startPoint: { x: pointer.x, y: pointer.y },
      currentShape: null
    });

    let shape: FabricObject | null = null;

    if (activeTool === 'rectangle') {
      shape = createRectangle(pointer.x, pointer.y);
      canvas.add(shape);
    } else if (activeTool === 'circle') {
      shape = createCircle(pointer.x, pointer.y);
      canvas.add(shape);
    }

    if (shape) {
      setDrawingState(prev => ({ ...prev, currentShape: shape }));
    }
  };
}

/**
 * Mouse move event handler for drawing operations
 */
export function createMouseMoveHandler(
  canvas: FabricCanvas,
  activeTool: Tool,
  drawingState: DrawingState
) {
  return (e?: FabricEvent<Event>) => {
    if (!e || !drawingState.isDrawing || !drawingState.startPoint || !activeTool) return;

    const pointer = canvas.getPointer(e.e);

    if (activeTool === 'rectangle' && drawingState.currentShape) {
      updateRectangleShape(drawingState.currentShape, drawingState.startPoint, pointer);
    } else if (activeTool === 'circle' && drawingState.currentShape) {
      updateCircleShape(drawingState.currentShape, drawingState.startPoint, pointer);
    }

    canvas.renderAll();
  };
}

/**
 * Mouse up event handler for drawing operations
 */
export function createMouseUpHandler(
  drawingState: DrawingState,
  setDrawingState: (state: DrawingState) => void,
  saveToHistory: () => void,
  onFinish?: () => void,
  onShapeComplete?: () => void
) {
  return () => {
    if (!drawingState.isDrawing) return;

    if (drawingState.currentShape) {
      finalizeShape(drawingState.currentShape);
      saveToHistory();
      onFinish?.();
      onShapeComplete?.();
    }

    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentShape: null
    });
  };
}

/**
 * Update rectangle shape during drawing
 */
function updateRectangleShape(
  shape: FabricObject,
  startPoint: { x: number; y: number },
  currentPoint: { x: number; y: number }
): void {
  const rect = normalizeRectangle(
    startPoint.x,
    startPoint.y,
    currentPoint.x,
    currentPoint.y
  );
  
  (shape as unknown as { set: (options: Record<string, unknown>) => void }).set({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  });
}

/**
 * Update circle shape during drawing
 */
function updateCircleShape(
  shape: FabricObject,
  startPoint: { x: number; y: number },
  currentPoint: { x: number; y: number }
): void {
  const deltaX = currentPoint.x - startPoint.x;
  const deltaY = currentPoint.y - startPoint.y;
  const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2;

  (shape as unknown as { set: (options: Record<string, unknown>) => void }).set({
    left: Math.min(startPoint.x, currentPoint.x),
    top: Math.min(startPoint.y, currentPoint.y),
    radius: radius
  });
}