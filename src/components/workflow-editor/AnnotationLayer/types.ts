/**
 * Type definitions for the AnnotationLayer component
 */

import type { CanvasState } from '../../../utils/annotationUtils';

/**
 * Available annotation tools
 */
export type Tool = 'select' | 'rectangle' | 'circle' | 'freehand' | 'freedraw';

/**
 * Fabric.js event interface
 */
export interface FabricEvent<T = Event> {
  e: T;
  target?: FabricObject;
}

/**
 * Fabric.js object interface
 */
export interface FabricObject {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  radius?: number;
  type?: string;
  set(options: Record<string, unknown>): void;
  setCoords(): void;
}

/**
 * Extended Fabric.js canvas interface
 */
export interface FabricCanvas {
  // Core canvas methods
  getPointer(e: Event): { x: number; y: number };
  add(object: FabricObject): void;
  remove(object: FabricObject): void;
  getObjects(): FabricObject[];
  getActiveObjects(): FabricObject[];
  discardActiveObject(): void;
  clear(): void;
  renderAll(): void;
  dispose(): void;
  
  // Export methods
  toDataURL(options?: Record<string, unknown>): string;
  toSVG(): string;
  toJSON(propertiesToInclude?: string[]): Record<string, unknown>;
  loadFromJSON(json: Record<string, unknown>, callback: () => void): void;
  
  // Dimension methods
  getWidth(): number;
  getHeight(): number;
  setDimensions(dimensions: { width: number; height: number }): void;
  
  // Event methods
  on(eventName: string, handler: (e?: FabricEvent) => void): void;
  off(eventName: string, handler: (e?: FabricEvent) => void): void;
  
  // Drawing properties
  isDrawingMode: boolean;
  selection: boolean;
  skipTargetFind: boolean;
  backgroundColor: string;
  freeDrawingBrush: {
    width: number;
    color: string;
  };
  
  // Canvas element
  upperCanvasEl: HTMLElement;
  
  // Canvas configuration
  preserveObjectStacking: boolean;
  defaultCursor: string;
  hoverCursor: string;
  moveCursor: string;
}

/**
 * Props for the AnnotationLayer component
 */
export interface AnnotationLayerProps {
  /** Currently active tool, controlled by parent */
  activeTool: Tool;
  /** Called when a drawing operation completes */
  onFinish?: () => void;
  /** Called when export operation is triggered */
  onExport?: (dataUrl: string) => void;
  /** Optional initial state to load */
  initialJSON?: CanvasState | null;
  /** Additional CSS classes */
  className?: string;
  /** Container styles */
  style?: React.CSSProperties;
}

/**
 * Imperative handle interface for the annotation layer
 */
export interface AnnotationLayerHandle {
  /** Returns current canvas state as JSON */
  snapshot(): CanvasState | null;
  /** Loads canvas state from JSON */
  load(json: CanvasState | null): Promise<void>;
  /** Exports canvas as PNG data URL */
  exportPNG(): string;
  /** Exports canvas as SVG string */
  exportSVG(): string;
  /** Clears all annotations */
  clear(): void;
  /** Undoes last action */
  undo(): void;
  /** Redoes last undone action */
  redo(): void;
  /** Gets canvas instance for advanced operations */
  getCanvas(): FabricCanvas | null;
}

/**
 * Drawing state for tracking current operation
 */
export interface DrawingState {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentShape: FabricObject | null;
}

/**
 * Canvas configuration options
 */
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  preserveObjectStacking: boolean;
  selection: boolean;
  defaultCursor: string;
  hoverCursor: string;
  moveCursor: string;
}

/**
 * Drawing tool configuration
 */
export interface DrawingToolConfig {
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
  brushWidth: number;
  brushColor: string;
}

/**
 * History manager interface
 */
export interface HistoryManager {
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}