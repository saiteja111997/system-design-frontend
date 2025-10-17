/**
 * Mouse event handlers for drawing operations
 */

import { normalizeRectangle } from '../../../utils/annotationUtils';
import { 
  createRectangle, 
  createCircle, 
  createLine, 
  createArrow, 
  createText, 
  finalizeShape 
} from './canvasOperations';
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
  setDrawingState: (state: DrawingState | ((prev: DrawingState) => DrawingState)) => void,
  onTextCreated?: (textObject: FabricObject) => void
) {
  return (e?: FabricEvent<Event>) => {
    if (!e || !activeTool || activeTool === 'select') return;

    const pointer = canvas.getPointer(e.e);
    
    // Special handling for text tool - create immediately and make editable
    if (activeTool === 'text') {
      const textShape = createText(pointer.x, pointer.y);
      canvas.add(textShape);
      canvas.setActiveObject(textShape);
      
      // Enter edit mode and select all placeholder text for easy replacement
      const textObj = textShape as unknown as { 
        enterEditing?: () => void;
        exitEditing?: () => void;
        selectAll?: () => void;
        hiddenTextarea?: HTMLTextAreaElement;
        text?: string;
        set?: (props: Record<string, unknown>) => void;
        __isPlaceholder?: boolean;
      };
      
      // Mark as placeholder
      textObj.__isPlaceholder = true;
      
      // Store cleanup references
      let timeoutId: NodeJS.Timeout | null = null;
      let cleanupDone = false;
      
      // Cleanup function to remove all listeners and timeouts
      const cleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // Remove cleanup listeners
        canvas.off('object:removed', handleRemoved);
        canvas.off('text:editing:exited', handleEditingExited);
        canvas.off('text:changed', handleTextChanged);
      };
      
      // Handle text changes to clear placeholder on first real input
      const handleTextChanged = () => {
        if (textObj.__isPlaceholder && textObj.text && textObj.text !== 'Click to type...') {
          textObj.__isPlaceholder = false;
          textObj.set?.({ opacity: 1 });
          canvas.renderAll();
        }
      };
      
      // Handle object removal (cleanup if deleted before input)
      const handleRemoved = (e?: FabricEvent) => {
        if (e?.target === textShape) {
          cleanup();
        }
      };
      
      // Handle editing exit - remove if still placeholder and empty
      const handleEditingExited = () => {
        // If user exits without typing anything meaningful, remove the text object
        if (textObj.__isPlaceholder || !textObj.text || textObj.text.trim() === '' || textObj.text === 'Click to type...') {
          canvas.remove(textShape);
          canvas.renderAll();
        } else {
          // Make fully opaque when done editing
          textObj.set?.({ opacity: 1 });
          canvas.renderAll();
        }
        cleanup();
      };
      
      // Small delay to ensure text is rendered before entering edit mode
      timeoutId = setTimeout(() => {
        timeoutId = null; // Clear reference after timeout fires
        
        try {
          // Enter editing mode
          textObj.enterEditing?.();
          
          // Select all placeholder text immediately
          if (textObj.hiddenTextarea) {
            textObj.hiddenTextarea.select();
          }
          
          // Setup cleanup listeners for object lifecycle
          canvas.on('object:removed', handleRemoved);
          canvas.on('text:editing:exited', handleEditingExited);
          canvas.on('text:changed', handleTextChanged);
          
        } catch (error) {
          console.warn('[AnnotationLayer] Failed to enter text edit mode:', error);
          cleanup();
        }
        
        canvas.renderAll();
      }, 100); // Slightly longer delay for better stability
      
      // Notify parent to save after editing completes
      if (onTextCreated) {
        onTextCreated(textShape);
      }
      
      return;
    }

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
    } else if (activeTool === 'line') {
      shape = createLine(pointer.x, pointer.y);
      canvas.add(shape);
    } else if (activeTool === 'arrow') {
      shape = createArrow(pointer.x, pointer.y);
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
    } else if (activeTool === 'line' && drawingState.currentShape) {
      updateLineShape(drawingState.currentShape, drawingState.startPoint, pointer);
    } else if (activeTool === 'arrow' && drawingState.currentShape) {
      updateArrowShape(drawingState.currentShape, drawingState.startPoint, pointer);
    }

    canvas.renderAll();
  };
}

/**
 * Mouse up event handler for drawing operations
 */
export function createMouseUpHandler(
  canvas: FabricCanvas,
  drawingState: DrawingState,
  setDrawingState: (state: DrawingState) => void,
  saveToHistory: () => void,
  onFinish?: () => void,
  onShapeComplete?: () => void
) {
  return () => {
    if (!drawingState.isDrawing) return;

    if (drawingState.currentShape) {
      // Add arrowhead for arrow shapes
      const shapeWithType = drawingState.currentShape as unknown as { arrowType?: string };
      if (shapeWithType.arrowType === 'arrow') {
        addArrowhead(canvas, drawingState.currentShape);
      }
      
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

/**
 * Update line shape during drawing
 */
function updateLineShape(
  shape: FabricObject,
  startPoint: { x: number; y: number },
  currentPoint: { x: number; y: number }
): void {
  (shape as unknown as { set: (options: Record<string, unknown>) => void }).set({
    x2: currentPoint.x,
    y2: currentPoint.y
  });
}

/**
 * Update arrow shape during drawing
 * Arrow is a line with an arrowhead at the end
 */
function updateArrowShape(
  shape: FabricObject,
  startPoint: { x: number; y: number },
  currentPoint: { x: number; y: number }
): void {
  // Update the line portion
  (shape as unknown as { set: (options: Record<string, unknown>) => void }).set({
    x2: currentPoint.x,
    y2: currentPoint.y
  });
}

/**
 * Add an arrowhead to a line shape
 * Creates a triangle at the end of the line pointing in the direction of the line
 */
function addArrowhead(canvas: FabricCanvas, lineShape: FabricObject): void {
  try {
    const line = lineShape as unknown as { 
      x1?: number; 
      y1?: number; 
      x2?: number; 
      y2?: number;
      stroke?: string;
      strokeWidth?: number;
      arrowHeadSize?: number;
    };
    
    const x1 = line.x1 ?? 0;
    const y1 = line.y1 ?? 0;
    const x2 = line.x2 ?? 0;
    const y2 = line.y2 ?? 0;
    
    // Calculate angle of the line
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Read arrowhead size from the line object, fallback to 15 if not set
    const headLength = line.arrowHeadSize ?? 15;
    const headAngle = Math.PI / 6; // 30 degrees
    
    // Calculate arrowhead points
    const arrowPoint1X = x2 - headLength * Math.cos(angle - headAngle);
    const arrowPoint1Y = y2 - headLength * Math.sin(angle - headAngle);
    const arrowPoint2X = x2 - headLength * Math.cos(angle + headAngle);
    const arrowPoint2Y = y2 - headLength * Math.sin(angle + headAngle);
    
    // Create arrowhead lines
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fabricModule = typeof window !== 'undefined' ? require('fabric') : {};
    const fabricNs = fabricModule.fabric || fabricModule;
    
    if (fabricNs.Line) {
      const arrowLine1 = new fabricNs.Line([x2, y2, arrowPoint1X, arrowPoint1Y], {
        stroke: line.stroke || '#000',
        strokeWidth: line.strokeWidth || 2,
        selectable: false,
        evented: false
      });
      
      const arrowLine2 = new fabricNs.Line([x2, y2, arrowPoint2X, arrowPoint2Y], {
        stroke: line.stroke || '#000',
        strokeWidth: line.strokeWidth || 2,
        selectable: false,
        evented: false
      });
      
      canvas.add(arrowLine1);
      canvas.add(arrowLine2);
      
      // Store reference to arrowhead lines on the main line for cleanup
      (lineShape as unknown as { arrowheadLines?: FabricObject[] }).arrowheadLines = [arrowLine1, arrowLine2];
    }
  } catch (e) {
    console.warn('[AnnotationLayer] Failed to add arrowhead', e);
  }
}