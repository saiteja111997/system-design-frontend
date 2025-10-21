# Canvas Hooks Architecture Documentation

## 📊 Hook Architecture Overview

Our canvas system is built using a **separation of concerns** approach with specialized hooks that work together to provide a scalable and maintainable solution.

## 🔧 Individual Hooks

### 1. `useCanvasCoordinates`

**Purpose**: Coordinate system transformation utilities
**Responsibilities**:

- Convert viewport coordinates to canvas coordinates
- Convert canvas coordinates to viewport coordinates
- Check if points are visible in viewport
- Handle zoom/pan coordinate transformations

**Usage**:

```typescript
const { getCanvasCoordinates, getViewportCoordinates, isPointVisible } =
  useCanvasCoordinates({ canvasRef });
```

### 2. `useCanvasViewport` (formerly `useCanvasControls`)

**Purpose**: Viewport management (zoom, pan, transform)
**Responsibilities**:

- Zoom in/out/reset operations
- Mouse and touch panning
- Pinch-to-zoom gestures
- Transform style generation
- Viewport state management

**Usage**:

```typescript
const { zoomIn, zoomOut, handlePanStart, transform, getTransformStyle } =
  useCanvasViewport();
```

### 3. `useNodeInteractions` (formerly `useWorkflowInteractions`)

**Purpose**: Node-specific interactions
**Responsibilities**:

- Node selection and deselection
- Node dragging operations
- Connection creation between nodes
- Node deletion
- Connection line management

**Usage**:

```typescript
const { handleNodeSelect, handleNodeDragStart, handleConnectionStart } =
  useNodeInteractions({ getCanvasCoordinates });
```

### 4. `useCanvasTools`

**Purpose**: Drawing tool management
**Responsibilities**:

- Tool selection (selection, rectangle, free draw, etc.)
- Tool settings management
- Drawing state tracking
- Cursor style management
- Canvas actions (undo, redo, clear)

**Usage**:

```typescript
const { activeTool, setActiveTool, getCursorStyle, executeAction } =
  useCanvasTools();
```

### 5. `useWorkflowCanvas` (Main Orchestrator)

**Purpose**: Unified interface combining all canvas functionality
**Responsibilities**:

- Coordinate all sub-hooks
- Provide unified event handlers
- Handle keyboard shortcuts
- Manage interaction priorities
- Provide clean component integration

**Usage**:

```typescript
const { canvasEventHandlers, canvasStyle, viewport, tools, nodeInteractions } =
  useWorkflowCanvas({ canvasRef });
```

## 🚀 Optimization Strategies

### Performance Optimizations

1. **Zustand Selectors**: Each hook subscribes only to relevant state slices

```typescript
const nodes = useWorkflowStore((state) => state.nodes); // Only re-render when nodes change
```

2. **useCallback Dependencies**: Minimal dependency arrays to prevent unnecessary re-renders

```typescript
const handleNodeDrag = useCallback(
  (e) => {
    /* ... */
  },
  [draggingNode, dragOffset, updateNodePosition]
);
```

3. **Event Handler Memoization**: Unified event handlers are memoized

```typescript
const canvasEventHandlers = useMemo(
  () => ({
    /* handlers */
  }),
  [
    /* minimal deps */
  ]
);
```

4. **Coordinate Transformation Caching**: Canvas coordinate calculations are optimized

### Scalability Features

1. **Separation of Concerns**: Each hook has a single responsibility
2. **Composition over Inheritance**: Hooks can be used independently or together
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Plugin Architecture**: Easy to extend with new tools or interactions

## 📝 Naming Convention Improvements

### ❌ Previous Names → ✅ Improved Names

- `useWorkflowInteractions` → `useNodeInteractions` (more specific)
- `useCanvasControls` → `useCanvasViewport` (clearer purpose)
- `handleMouseDown` → `handleNodeDragStart` (action-specific)
- `handleMouseMove` → `handleNodeDrag` / `handleConnectionDrag` (split by purpose)

### Naming Rules Applied

1. **Verb + Noun Pattern**: `handleNodeDrag`, `setActiveTool`
2. **Domain-Specific Names**: `useNodeInteractions` instead of generic `useInteractions`
3. **Action-Oriented**: `handleConnectionStart` vs `handleMouseDown`
4. **Consistent Prefixes**: All handlers start with `handle`, all setters with `set`

## 🔄 Migration Guide

### From Old Architecture

```typescript
// OLD: Mixed responsibilities
const { handleNodeMouseDown, handleMouseMove } = useWorkflowInteractions({
  canvasRef,
  ...allProps,
});

// NEW: Separated concerns
const { getCanvasCoordinates } = useCanvasCoordinates({ canvasRef });
const { handleNodeDragStart } = useNodeInteractions({ getCanvasCoordinates });
const { handlePanStart } = useCanvasViewport();

// OR: Use orchestrator for simple integration
const { canvasEventHandlers } = useWorkflowCanvas({ canvasRef });
```

### Component Integration

```typescript
// Simple integration with orchestrator
function WorkflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { canvasEventHandlers, canvasStyle, nodeInteractions } =
    useWorkflowCanvas({ canvasRef });

  return (
    <div
      ref={canvasRef}
      style={canvasStyle}
      {...canvasEventHandlers}
      data-canvas-area="true"
    >
      {/* Canvas content */}
    </div>
  );
}
```

## 🎯 Best Practices

### Hook Usage

1. **Use the orchestrator** (`useWorkflowCanvas`) for most components
2. **Use individual hooks** when you need fine-grained control
3. **Always pass required dependencies** to maintain proper hook chains
4. **Use TypeScript interfaces** for prop validation

### Performance

1. **Minimize re-renders** by using specific Zustand selectors
2. **Memoize expensive calculations** in coordinate transformations
3. **Debounce high-frequency events** if needed
4. **Use React DevTools Profiler** to identify bottlenecks

### Extensibility

1. **Add new tools** by extending the `CanvasTool` type and tool handlers
2. **Create specialized hooks** for complex interactions
3. **Use the coordinate system** for any position-based calculations
4. **Follow the naming conventions** for consistency

This architecture provides a solid foundation for complex canvas interactions while maintaining clean separation of concerns and optimal performance.
