/**
 * AnnotationLayer - Public API exports
 * Enterprise-grade barrel exports with consistent patterns
 */

// Primary components (mixed exports for compatibility)
export { AnnotationLayer } from './AnnotationLayer';
export { default as AnnotationLayerDefault } from './AnnotationLayer';
export { FallbackUI } from './FallbackUI';
export { useAnnotationInternal } from './useAnnotationInternal';

// Named exports for hooks and utilities
export { useCanvasSetup, useDrawingState, useHistoryManager } from './hooks';
export { createImperativeHandlers } from './imperativeHandlers';

// Type exports
export type { 
  AnnotationLayerProps, 
  AnnotationLayerHandle, 
  Tool,
  FabricEvent,
  FabricObject,
  FabricCanvas,
  DrawingState,
  CanvasConfig,
  DrawingToolConfig,
  HistoryManager
} from './types';