# AnnotationLayer Component

A comprehensive, production-ready React annotation overlay component built with Fabric.js. Provides drawing tools (rectangle, circle, free-hand), object selection/transformation, undo/redo history, and export capabilities.

## Features

- ✅ **Drawing Tools**: Rectangle, circle, and free-hand drawing
- ✅ **Object Management**: Selection, movement, resizing, and deletion
- ✅ **History System**: Smart undo/redo with configurable history size
- ✅ **High-DPI Export**: Crisp PNG and SVG exports with device pixel ratio support
- ✅ **Responsive**: Automatic resize handling with object scaling
- ✅ **Accessibility**: Keyboard shortcuts and ARIA attributes
- ✅ **Serialization**: Complete state save/load with JSON
- ✅ **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install fabric
```

## Basic Usage

```tsx
import React, { useRef, useState } from "react";
import {
  AnnotationLayer,
  AnnotationLayerHandle,
  Tool,
} from "@/components/workflow-editor/AnnotationLayer";

export default function DrawingApp() {
  const annotationRef = useRef<AnnotationLayerHandle>(null);
  const [activeTool, setActiveTool] = useState<Tool>("rectangle");

  const handleExport = () => {
    const dataUrl = annotationRef.current?.exportPNG();
    if (dataUrl) {
      // Download or upload the image
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "annotation.png";
      link.click();
    }
  };

  const handleUndo = () => {
    annotationRef.current?.undo();
  };

  const handleRedo = () => {
    annotationRef.current?.redo();
  };

  const handleSave = () => {
    const snapshot = annotationRef.current?.snapshot();
    if (snapshot) {
      localStorage.setItem("annotations", JSON.stringify(snapshot));
    }
  };

  const handleLoad = () => {
    const saved = localStorage.getItem("annotations");
    if (saved) {
      const data = JSON.parse(saved);
      annotationRef.current?.load(data);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setActiveTool("rectangle")}
          className={`px-3 py-2 rounded ${
            activeTool === "rectangle"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Rectangle
        </button>
        <button
          onClick={() => setActiveTool("circle")}
          className={`px-3 py-2 rounded ${
            activeTool === "circle" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Circle
        </button>
        <button
          onClick={() => setActiveTool("free")}
          className={`px-3 py-2 rounded ${
            activeTool === "free" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Free Draw
        </button>
        <button
          onClick={() => setActiveTool("select")}
          className={`px-3 py-2 rounded ${
            activeTool === "select" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Select
        </button>
        <button onClick={handleUndo} className="px-3 py-2 bg-gray-200 rounded">
          Undo
        </button>
        <button onClick={handleRedo} className="px-3 py-2 bg-gray-200 rounded">
          Redo
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-2 bg-green-500 text-white rounded"
        >
          Export PNG
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-2 bg-purple-500 text-white rounded"
        >
          Load
        </button>
      </div>

      {/* Main content area */}
      <div className="w-full h-full bg-gray-100">
        {/* Your main application content goes here */}
        <div className="p-8">
          <h1>Your Application Content</h1>
          <p>The annotation layer overlays this content when active.</p>
        </div>
      </div>

      {/* Annotation Layer */}
      <AnnotationLayer
        ref={annotationRef}
        activeTool={activeTool}
        onFinish={() => console.log("Drawing completed")}
        onExport={(dataUrl) => console.log("Exported:", dataUrl)}
        className="pointer-events-none" // Let clicks pass through when not drawing
      />
    </div>
  );
}
```

## Integration with Existing Dock

If you already have a dock/toolbar component, you can easily integrate the AnnotationLayer:

```tsx
// In your existing dock component
import {
  AnnotationLayer,
  AnnotationLayerHandle,
  Tool,
} from "@/components/workflow-editor/AnnotationLayer";

export function YourExistingDock() {
  const annotationRef = useRef<AnnotationLayerHandle>(null);
  const [activeTool, setActiveTool] = useState<Tool>(null);

  // Your existing dock buttons
  const dockItems = [
    {
      id: "rectangle",
      icon: "⬜",
      onClick: () =>
        setActiveTool(activeTool === "rectangle" ? null : "rectangle"),
    },
    {
      id: "circle",
      icon: "⭕",
      onClick: () => setActiveTool(activeTool === "circle" ? null : "circle"),
    },
    {
      id: "free-draw",
      icon: "✏️",
      onClick: () => setActiveTool(activeTool === "free" ? null : "free"),
    },
  ];

  return (
    <>
      {/* Your existing dock UI */}
      <div className="dock">
        {dockItems.map((item) => (
          <button key={item.id} onClick={item.onClick}>
            {item.icon}
          </button>
        ))}
      </div>

      {/* Add the annotation layer */}
      <AnnotationLayer
        ref={annotationRef}
        activeTool={activeTool}
        onFinish={() => setActiveTool(null)} // Auto-deselect after drawing
      />
    </>
  );
}
```

## API Reference

### Props

| Prop           | Type                        | Default | Description                                                                                |
| -------------- | --------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `activeTool`   | `Tool`                      | -       | Currently active drawing tool (`'rectangle'`, `'circle'`, `'free'`, `'select'`, or `null`) |
| `onFinish?`    | `() => void`                | -       | Called when a drawing operation completes                                                  |
| `onExport?`    | `(dataUrl: string) => void` | -       | Called when export methods are invoked                                                     |
| `initialJSON?` | `CanvasState \| null`       | -       | Initial annotation state to load                                                           |
| `className?`   | `string`                    | `''`    | Additional CSS classes                                                                     |
| `style?`       | `React.CSSProperties`       | `{}`    | Inline styles                                                                              |

### Imperative Methods (via ref)

| Method        | Returns                | Description                                       |
| ------------- | ---------------------- | ------------------------------------------------- |
| `snapshot()`  | `CanvasState \| null`  | Returns current canvas state as JSON              |
| `load(json)`  | `Promise<void>`        | Loads canvas state from JSON                      |
| `exportPNG()` | `string`               | Exports canvas as PNG data URL                    |
| `exportSVG()` | `string`               | Exports canvas as SVG string                      |
| `clear()`     | `void`                 | Clears all annotations                            |
| `undo()`      | `void`                 | Undoes last action                                |
| `redo()`      | `void`                 | Redoes last undone action                         |
| `getCanvas()` | `FabricCanvas \| null` | Gets raw Fabric.js canvas for advanced operations |

### Tool Types

```typescript
type Tool = "rectangle" | "circle" | "free" | "select" | null;
```

- `'rectangle'`: Draw rectangles by dragging
- `'circle'`: Draw circles by dragging
- `'free'`: Free-hand drawing with brush
- `'select'`: Select and manipulate existing objects
- `null`: Disable annotation layer (pointer events disabled)

## Keyboard Shortcuts

When the annotation layer has focus:

- **Escape**: Cancel current drawing operation or deselect objects
- **Delete/Backspace**: Delete selected objects
- **R**: Quick switch to rectangle tool (if parent implements)
- **C**: Quick switch to circle tool (if parent implements)
- **F**: Quick switch to free draw tool (if parent implements)

## Styling and Customization

The component uses absolute positioning and fills its container. You can customize appearance:

```tsx
<AnnotationLayer
  activeTool={tool}
  className="custom-annotation-layer"
  style={{
    zIndex: 1000,
    background: "rgba(0,0,0,0.1)", // Semi-transparent overlay
  }}
/>
```

CSS styling for drawn objects can be customized by modifying the Fabric.js object creation in the component.

## Advanced Usage

### Custom Object Properties

Access the raw Fabric.js canvas for advanced customization:

```tsx
const canvas = annotationRef.current?.getCanvas();
if (canvas) {
  // Customize brush properties
  canvas.freeDrawingBrush.width = 5;
  canvas.freeDrawingBrush.color = "#ff0000";

  // Add custom object properties
  canvas.getObjects().forEach((obj) => {
    obj.set("customProperty", "value");
  });
}
```

### Persistence

Save and restore annotation state:

```tsx
// Save to server
const saveAnnotations = async () => {
  const state = annotationRef.current?.snapshot();
  if (state) {
    await fetch("/api/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  }
};

// Load from server
const loadAnnotations = async () => {
  const response = await fetch("/api/annotations");
  const state = await response.json();
  await annotationRef.current?.load(state);
};
```

### Export Options

```tsx
// Export with custom options
const exportHighRes = () => {
  const canvas = annotationRef.current?.getCanvas();
  if (canvas) {
    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 3, // 3x resolution
      quality: 0.9,
    });
    // Handle export
  }
};

// Export SVG for vector graphics
const exportVector = () => {
  const svgString = annotationRef.current?.exportSVG();
  if (svgString) {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    // Handle SVG export
  }
};
```

## Testing

Unit tests are provided for the utility functions:

```bash
npm test annotationUtils.test.ts
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Considerations

- History is capped at 50 states by default to prevent memory issues
- Canvas operations are debounced to avoid excessive history snapshots
- High-DPI export may be memory intensive on very large canvases
- Consider disabling the layer (`activeTool={null}`) when not needed

## Troubleshooting

### Common Issues

1. **"fabric is not defined"**: Ensure fabric.js is installed and imported correctly
2. **Canvas not responsive**: Check that the parent container has defined dimensions
3. **Export quality issues**: Adjust `devicePixelRatio` or export multiplier
4. **Performance issues**: Reduce history size or debounce intervals

### Debug Mode

Enable console logging for debugging:

```tsx
const handleFinish = () => {
  const state = annotationRef.current?.snapshot();
  console.log("Current state:", state);
};
```

This annotation system provides a robust foundation for drawing capabilities in any React application while maintaining clean separation of concerns and excellent TypeScript support.
