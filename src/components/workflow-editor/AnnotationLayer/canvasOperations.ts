/**
 * Canvas operations and initialization logic
 */

import { setCanvasSize } from '../../../utils/annotationUtils';
import type { FabricCanvas, FabricObject, CanvasConfig, DrawingToolConfig, Tool } from './types';

// Robust fabric import supporting both CJS & ESM shapes and preventing SSR usage
// We keep it sync because this code only runs on client (component has 'use client')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fabricModule = typeof window !== 'undefined' ? require('fabric') : {};

// Minimal subset of the fabric namespace we rely on (avoid 'any')
type FabricNamespace = {
  Canvas: new (el: HTMLCanvasElement, opts: Record<string, unknown>) => FabricCanvas;
  Rect: new (opts: Record<string, unknown>) => FabricObject;
  Circle: new (opts: Record<string, unknown>) => FabricObject;
  Line: new (coords: number[], opts: Record<string, unknown>) => FabricObject;
  Triangle: new (opts: Record<string, unknown>) => FabricObject;
  Group: new (objects: FabricObject[], opts: Record<string, unknown>) => FabricObject;
  IText: new (text: string, opts: Record<string, unknown>) => FabricObject;
  Textbox: new (text: string, opts: Record<string, unknown>) => FabricObject;
  PencilBrush?: new (canvas: FabricCanvas) => { width: number; color: string };
};

// fabric v6 may export either { fabric } or namespace directly
// Cast carefully; if undefined at runtime we will guard before usage
const fabricNsRaw = (fabricModule.fabric || fabricModule) as Partial<FabricNamespace> | undefined;
function ensureFabric<K extends keyof FabricNamespace>(feature: K): FabricNamespace[K] {
  if (!fabricNsRaw || !fabricNsRaw[feature]) {
    throw new Error(`Fabric.js not loaded or missing feature: ${feature}`);
  }
  return fabricNsRaw[feature]!;
}

/**
 * Default canvas configuration
 */
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 800,
  height: 600,
  backgroundColor: 'transparent',
  preserveObjectStacking: true,
  selection: true,
  defaultCursor: 'default',
  hoverCursor: 'default',
  moveCursor: 'default'
};

/**
 * Default drawing tool configuration
 */
export const DEFAULT_DRAWING_CONFIG: DrawingToolConfig = {
  strokeWidth: 2,
  strokeColor: '#222', // Will be overridden by getDefaultDrawingConfig
  fillColor: 'transparent',
  brushWidth: 2,
  brushColor: '#222' // Will be overridden by getDefaultDrawingConfig
};

/**
 * Get runtime drawing configuration based on current theme
 */
export function getDefaultDrawingConfig(theme?: 'dark' | 'light'): DrawingToolConfig {
  // Determine dark mode priority order:
  // 1. Explicit param
  // 2. Tailwind 'dark' class on <html>
  // 3. CSS variable --annotation-stroke (if defined) overrides color choice directly
  // 4. prefers-color-scheme media query
  let isDark = false;

  if (theme) {
    isDark = theme === 'dark';
  } else if (typeof window !== 'undefined') {
    const root = document.documentElement;

    // Tailwind / manual class toggle has highest priority for mode detection
    if (root.classList.contains('dark')) {
      isDark = true;
    }

    // If a custom stroke color is provided via CSS variable we honor it directly
    const annotationStroke = getComputedStyle(root)
      .getPropertyValue('--annotation-stroke')
      .trim();
    if (annotationStroke) {
      return {
        ...DEFAULT_DRAWING_CONFIG,
        strokeColor: annotationStroke,
        brushColor: annotationStroke
      };
    }

    // Fallback to system preference only if class not explicitly set
    if (!theme && !root.classList.contains('dark')) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  // Use pure white / pure black for maximum contrast instead of mid gray (#222) / light gray (#e5e7eb)
  // This fixes the reported issue where lines were not visible enough in light mode.
  const themeColor = isDark ? '#ffffff' : '#000000';

  return {
    ...DEFAULT_DRAWING_CONFIG,
    strokeColor: themeColor,
    brushColor: themeColor
  };
}

/**
 * Initialize a Fabric.js canvas with proper configuration
 */
export function initializeFabricCanvas(
  canvasElement: HTMLCanvasElement,
  containerRect: DOMRect,
  config: Partial<CanvasConfig> = {}
): FabricCanvas {
  const finalConfig = { ...DEFAULT_CANVAS_CONFIG, ...config };
  
  // Create fabric canvas
  const CanvasCtor = ensureFabric('Canvas');
  const fabricCanvas = new CanvasCtor(canvasElement, {
    width: containerRect.width,
    height: containerRect.height,
    backgroundColor: finalConfig.backgroundColor,
    preserveObjectStacking: finalConfig.preserveObjectStacking,
    selection: finalConfig.selection,
    defaultCursor: finalConfig.defaultCursor,
    hoverCursor: finalConfig.hoverCursor,
    moveCursor: finalConfig.moveCursor
  }) as FabricCanvas;

  // Set high-DPI canvas size
  setCanvasSize(canvasElement, containerRect.width, containerRect.height);
  
  // Configure free drawing brush
  configureBrush(fabricCanvas, getDefaultDrawingConfig());

  return fabricCanvas;
}

/**
 * Configure the drawing brush settings
 */
export function configureBrush(
  canvas: FabricCanvas, 
  config: Partial<DrawingToolConfig> = {}
): void {
  const finalConfig = { ...getDefaultDrawingConfig(), ...config };
  // Ensure a brush instance exists (Fabric v6 may require explicit instantiation)
  try {
    if (!canvas.freeDrawingBrush) {
      // Attempt to create a PencilBrush if available
      const PencilBrushCtor = (fabricNsRaw as unknown as { PencilBrush?: new (c: FabricCanvas) => { width: number; color: string } }).PencilBrush;
      if (PencilBrushCtor) {
        // Fabric's TS types may not expose assigning a new brush instance; cast to unknown first
        (canvas as unknown as { freeDrawingBrush: { width: number; color: string } }).freeDrawingBrush = new PencilBrushCtor(canvas);
      }
    }
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = finalConfig.brushWidth;
      canvas.freeDrawingBrush.color = finalConfig.brushColor;
    }
  } catch (e) {
    // Silently ignore brush configuration errors to avoid crashing initialization
  console.warn('[AnnotationLayer] Failed to configure brush', e);
  }
}

/**
 * Re-apply theme colors (stroke + brush) to existing canvas objects.
 * Used when user toggles between dark / light mode so previously drawn
 * annotations remain visible with high contrast.
 */
export function applyThemeColors(canvas: FabricCanvas, theme?: 'dark' | 'light') {
  try {
    const cfg = getDefaultDrawingConfig(theme);
    // Update existing drawable objects (rect, circle, path, line, text)
    canvas.getObjects().forEach(obj => {
      const t = (obj as unknown as { type?: string }).type;
      if (t && ['rect','circle','path','line'].includes(t)) {
        // Safely set stroke if supported
        (obj as unknown as { set: (props: Record<string, unknown>) => void }).set?.({ stroke: cfg.strokeColor });
      } else if (t && ['i-text','text'].includes(t)) {
        // For text objects, update fill instead of stroke
        (obj as unknown as { set: (props: Record<string, unknown>) => void }).set?.({ fill: cfg.strokeColor });
      }
    });
    configureBrush(canvas, cfg);
    canvas.renderAll();
  } catch (e) {
    console.warn('[AnnotationLayer] Failed to apply theme colors', e);
  }
}

/**
 * Create a rectangle shape for drawing
 */
export function createRectangle(
  x: number, 
  y: number, 
  config: Partial<DrawingToolConfig> = {}
): FabricObject {
  const finalConfig = { ...getDefaultDrawingConfig(), ...config };
  
  const RectCtor = ensureFabric('Rect');
  return new RectCtor({
    left: x,
    top: y,
    width: 0,
    height: 0,
    fill: finalConfig.fillColor,
    stroke: finalConfig.strokeColor,
    strokeWidth: finalConfig.strokeWidth,
    selectable: false,
    evented: false
  });
}

/**
 * Create a circle shape for drawing
 */
export function createCircle(
  x: number, 
  y: number, 
  config: Partial<DrawingToolConfig> = {}
): FabricObject {
  const finalConfig = { ...getDefaultDrawingConfig(), ...config };
  
  const CircleCtor = ensureFabric('Circle');
  return new CircleCtor({
    left: x,
    top: y,
    radius: 0,
    fill: finalConfig.fillColor,
    stroke: finalConfig.strokeColor,
    strokeWidth: finalConfig.strokeWidth,
    selectable: false,
    evented: false
  });
}

/**
 * Create a line shape for drawing
 */
export function createLine(
  x: number, 
  y: number, 
  config: Partial<DrawingToolConfig> = {}
): FabricObject {
  const finalConfig = { ...getDefaultDrawingConfig(), ...config };
  
  const LineCtor = ensureFabric('Line');
  return new LineCtor([x, y, x, y], {
    stroke: finalConfig.strokeColor,
    strokeWidth: finalConfig.strokeWidth,
    selectable: false,
    evented: false
  });
}

/**
 * Create an arrow shape for drawing
 * Arrow is a line with arrowhead markers
 */
export function createArrow(
  x: number, 
  y: number, 
  config: Partial<DrawingToolConfig> = {}
): FabricObject {
  const finalConfig = { ...getDefaultDrawingConfig(), ...config };
  
  const LineCtor = ensureFabric('Line');
  const line = new LineCtor([x, y, x, y], {
    stroke: finalConfig.strokeColor,
    strokeWidth: finalConfig.strokeWidth,
    selectable: false,
    evented: false,
    // Add arrowhead at the end of the line
    strokeLineCap: 'round'
  });
  
  // Store arrow metadata to identify it and add arrowhead after drawing
  (line as unknown as { arrowType?: string; arrowHeadSize?: number }).arrowType = 'arrow';
  (line as unknown as { arrowType?: string; arrowHeadSize?: number }).arrowHeadSize = 10;
  
  return line;
}

/**
 * Create a text object for drawing
 */
export function createText(
  x: number, 
  y: number, 
  config: Partial<DrawingToolConfig> = {}
): FabricObject {
  const finalConfig = { ...getDefaultDrawingConfig(), ...config };
  
  // Use Textbox instead of IText for resizable text boxes
  const TextboxCtor = ensureFabric('Textbox');
  return new TextboxCtor('', {
    left: x,
    top: y,
    width: 200, // Initial width for the textbox
    fill: finalConfig.strokeColor,
    fontSize: 18,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 400,
    selectable: true,
    evented: true,
    editable: true,
    // Text box behavior
    splitByGrapheme: true,
    // Better text rendering
    lineHeight: 1.4,
    charSpacing: 0,
    textAlign: 'left',
    // Improved appearance
    opacity: 1,
    // Interaction
    lockScalingFlip: true,
    lockSkewingX: true,
    lockSkewingY: true,
    // Only allow horizontal scaling (width adjustment)
    lockScalingY: true,
    // Padding for better text area
    padding: 8,
    // Borders/controls enabled - visibility managed by selection handlers (see useAnnotationInternal.ts)
    hasBorders: true,
    hasControls: true,
    // Corner style
    cornerStyle: 'circle',
    cornerColor: finalConfig.strokeColor,
    cornerSize: 6,
    transparentCorners: false,
    // Border styling - clean and minimal
    borderColor: finalConfig.strokeColor,
    borderScaleFactor: 1,
    // Make corners easier to grab
    touchCornerSize: 12,
    // Control positioning
    centeredScaling: false
  });
}

/**
 * Update the canvas interaction mode based on the active tool
 */
export function updateCanvasMode(
  canvas: FabricCanvas,
  activeTool?: Tool | null
): void {
  // Exit any active text editing before switching tools
  const activeObjects = canvas.getActiveObjects?.();
  const activeObject = activeObjects && activeObjects.length > 0 ? activeObjects[0] : null;
  
  if (activeObject) {
    const textObj = activeObject as unknown as { 
      type?: string; 
      isEditing?: boolean;
      exitEditing?: () => void;
    };
    
    // If there's a text object being edited, exit editing mode
    if ((textObj.type === 'textbox' || textObj.type === 'i-text' || textObj.type === 'text') && textObj.isEditing) {
      try {
        textObj.exitEditing?.();
      } catch (error) {
        console.warn('[AnnotationLayer] Error exiting text editing:', error);
      }
    }
    
    // When switching away from text tool, deselect any active object
    if (activeTool !== 'text' && activeTool !== 'select') {
      canvas.discardActiveObject?.();
      canvas.renderAll();
    }
  }

  // Normalize tool aliases
  const normalizedTool: "freehand" | "rectangle" | "circle" | "select" | "arrow" | "line" | "text" | null = (() => {
    if (!activeTool) return null;
    if (["freedraw", "freehand", "draw", "brush"].includes(activeTool)) return "freehand";
    if (["rectangle", "rect"].includes(activeTool)) return "rectangle";
    if (["ellipse", "circle"].includes(activeTool)) return "circle";
    if (["select", "selection"].includes(activeTool)) return "select";
    if (["arrow"].includes(activeTool)) return "arrow";
    if (["line"].includes(activeTool)) return "line";
    if (["text"].includes(activeTool)) return "text";
    return null;
  })();

  // Only freehand drawing enables drawing mode
  if (normalizedTool === "freehand") {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.skipTargetFind = true;
    canvas.defaultCursor = 'crosshair';
  } else if (normalizedTool === "text") {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.skipTargetFind = false;
    canvas.defaultCursor = 'text';
    canvas.hoverCursor = 'text';
  } else {
    canvas.isDrawingMode = false;
    canvas.selection = normalizedTool === "select";
    // Allow selection for select tool, disable for other drawing tools
    canvas.skipTargetFind = normalizedTool !== "select";
    canvas.defaultCursor = normalizedTool === "select" ? 'default' : 'crosshair';
    canvas.hoverCursor = 'move';
  }
  canvas.renderAll();
}

/**
 * Make a shape selectable and interactive
 */
export function finalizeShape(shape: FabricObject): void {
  shape.set({
    selectable: true,
    evented: true
  });
  shape.setCoords();
}

/**
 * Scale all objects proportionally during resize
 */
export function scaleCanvasObjects(
  canvas: FabricCanvas,
  scaleX: number,
  scaleY: number
): void {
  canvas.getObjects().forEach((obj) => {
    const left = (obj.left || 0) * scaleX;
    const top = (obj.top || 0) * scaleY;
    const objScaleX = (obj.scaleX || 1) * scaleX;
    const objScaleY = (obj.scaleY || 1) * scaleY;

    obj.set({
      left,
      top,
      scaleX: objScaleX,
      scaleY: objScaleY
    });
    obj.setCoords();
  });
}

/**
 * Clean up canvas resources
 */
export function disposeCanvas(canvas: FabricCanvas | null): void {
  if (canvas) {
    canvas.dispose();
  }
}