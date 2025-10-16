/**
 * Annotation utilities for canvas management, serialization, and history tracking
 * These functions are framework-agnostic and can be tested independently
 */

/**
 * Canvas state data structure
 */
export interface CanvasState {
  version: string;
  timestamp: number;
  canvasData: Record<string, unknown>;
  canvasSize: {
    width: number;
    height: number;
  };
}

/**
 * History entry for undo/redo functionality
 */
export interface HistoryEntry {
  json: CanvasState;
  timestamp: number;
}

/**
 * Fabric.js canvas interface (simplified)
 */
export interface FabricCanvas {
  toJSON(propertiesToInclude?: string[]): Record<string, unknown>;
  loadFromJSON(json: Record<string, unknown>, callback: () => void): void;
  getWidth(): number;
  getHeight(): number;
  setDimensions(dimensions: { width: number; height: number }): void;
  renderAll(): void;
}

/**
 * Sets canvas size with proper device pixel ratio handling for crisp exports
 * @param canvas - The HTML canvas element
 * @param cssWidth - Width in CSS pixels
 * @param cssHeight - Height in CSS pixels
 * @param scaleFactor - Optional scale factor (defaults to devicePixelRatio)
 */
export function setCanvasSize(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
  scaleFactor: number = window.devicePixelRatio || 1
): void {
  // Set actual canvas buffer size (high-DPI)
  canvas.width = cssWidth * scaleFactor;
  canvas.height = cssHeight * scaleFactor;
  
  // Set CSS size to maintain layout
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  
  // Scale context to ensure correct drawing operations
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(scaleFactor, scaleFactor);
  }
}

/**
 * Serializes canvas state including metadata for proper restoration
 * @param fabricCanvas - Fabric.js canvas instance
 * @returns Serialized canvas data
 */
export function serializeCanvas(fabricCanvas: FabricCanvas): CanvasState {
  return {
    version: '1.0',
    timestamp: Date.now(),
    canvasData: fabricCanvas.toJSON(['id', 'selectable', 'evented']),
    canvasSize: {
      width: fabricCanvas.getWidth(),
      height: fabricCanvas.getHeight()
    }
  };
}

/**
 * Restores canvas from serialized data
 * @param fabricCanvas - Fabric.js canvas instance
 * @param serializedData - Data from serializeCanvas
 * @returns Promise that resolves when restoration is complete
 */
export function restoreCanvas(fabricCanvas: FabricCanvas, serializedData: CanvasState | null): Promise<void> {
  return new Promise((resolve) => {
    if (!serializedData || !serializedData.canvasData) {
      resolve();
      return;
    }

    fabricCanvas.loadFromJSON(serializedData.canvasData, () => {
      // Restore canvas dimensions if they were stored
      if (serializedData.canvasSize) {
        fabricCanvas.setDimensions({
          width: serializedData.canvasSize.width,
          height: serializedData.canvasSize.height
        });
      }
      
      // Single render call after load completes
      fabricCanvas.renderAll();
      resolve();
    });
  });
}

/**
 * Manages undo/redo history with automatic state management
 */
export class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private maxSize: number;
  private suppressNextEntry: boolean = false;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Adds a new state to history
   * @param state - The state to save
   */
  push(state: CanvasState): void {
    if (this.suppressNextEntry) {
      this.suppressNextEntry = false;
      return;
    }

    const entry: HistoryEntry = {
      json: state,
      timestamp: Date.now()
    };

    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(entry);

    // Maintain max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Gets the previous state (for undo)
   * @returns Previous state or null if none available
   */
  undo(): CanvasState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex].json;
    }
    return null;
  }

  /**
   * Gets the next state (for redo)
   * @returns Next state or null if none available
   */
  redo(): CanvasState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex].json;
    }
    return null;
  }

  /**
   * Checks if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Checks if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Suppresses the next history entry (useful when loading from history)
   */
  suppressNext(): void {
    this.suppressNextEntry = true;
  }

  /**
   * Clears all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Gets current history size
   */
  size(): number {
    return this.history.length;
  }
}

/**
 * Debounces function calls to prevent excessive history snapshots
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Calculates scaling factor for container resize while preserving aspect ratio
 * @param oldSize - Previous container size
 * @param newSize - New container size
 * @returns Scale factors for x and y axes
 */
export function calculateResizeScale(
  oldSize: { width: number; height: number },
  newSize: { width: number; height: number }
): { scaleX: number; scaleY: number } {
  return {
    scaleX: newSize.width / oldSize.width,
    scaleY: newSize.height / oldSize.height
  };
}

/**
 * Constrains rectangle coordinates to handle negative width/height from inverted dragging
 * @param startX - Start X coordinate
 * @param startY - Start Y coordinate
 * @param currentX - Current X coordinate
 * @param currentY - Current Y coordinate
 * @returns Normalized rectangle coordinates
 */
export function normalizeRectangle(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number
): { left: number; top: number; width: number; height: number } {
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  return { left, top, width, height };
}

/**
 * Validates and cleans JSON data before loading into canvas
 * @param json - JSON data to validate
 * @returns Cleaned and validated JSON or null if invalid
 */
export function validateCanvasJSON(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== 'object' || json === null) {
    return null;
  }

  const jsonObj = json as Record<string, unknown>;

  // Basic validation for required Fabric.js properties
  if (!jsonObj.objects || !Array.isArray(jsonObj.objects)) {
    return null;
  }

  // Clean any potentially harmful properties
  const cleaned = {
    ...jsonObj,
    objects: jsonObj.objects.map((obj: unknown) => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      
      const objRecord = obj as Record<string, unknown>;
      return {
        ...objRecord,
        // Remove any non-serializable functions or event handlers
        evented: objRecord.evented !== false,
        selectable: objRecord.selectable !== false
      };
    })
  };

  return cleaned;
}