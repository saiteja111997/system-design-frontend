## 📁 Project Structure

# Workflow Editor

## 📁 Project Structure

```
src/
├── components/
│   ├── workflow-editor/
│   │   ├── AnimatedWorflowEditor.tsx       # Main editor component
│   │   ├── MainLayout.tsx                  # Layout wrapper
│   │   ├── Sidebar.tsx                     # Left sidebar navigation
│   │   ├── WorkflowNode.tsx                # Individual node component
│   │   ├── WorkflowEdge.tsx                # Edge/connection component
│   │   └── sidebar-right/                  # Right sidebar components
│   │       ├── AddNodeContent.tsx          # Add new node interface
│   │       ├── EditNodeContent.tsx         # Edit existing node interface
│   │       └── ConfigurationForm.tsx       # Node configuration form
├── stores/
│   └── workflowStore.ts                    # Zustand state management
├── data/
│   ├── nodeTypeOptions.tsx                 # Node type definitions & configs
│   └── workflowInitials.ts                 # Initial workflow data
├── hooks/
│   ├── useCanvasControls.ts                # Canvas zoom/pan controls
│   └── useWorkflowInteractions.ts          # Node/edge interactions
├── types/
│   └── workflow-editor/                    # TypeScript definitions
│       ├── workflow.ts                     # Core workflow types
│       ├── store.ts                        # Store types
│       └── sidebar-right.ts               # Sidebar component types
├── utils/
│   └── workflow.ts                         # Utility functions
└── styles/
    ├── workflowAnimations.css              # CSS animations
    └── dynamicClasses.css                  # Dynamic Tailwind classes
```

## 🏗️ Architecture Overview

### State Management

- **Zustand Store**: Centralized state with localStorage persistence
- **Immutable Updates**: Using Immer middleware for clean state mutations
- **Canvas Transform**: Zoom and pan state management
- **Node & Edge CRUD**: Complete operations for workflow elements

### Data Layer

- **Node Options**: Comprehensive node type definitions with configurations
- **Initial Data**: Clean separation of initial workflow from options
- **Type Safety**: Full TypeScript coverage with proper interfaces

### Component Structure

- **Main Editor**: Orchestrates entire workflow editing experience
- **Sidebar Navigation**: Context-aware right sidebar for node operations
- **Interactive Nodes**: Drag, select, hover states with visual feedback
- **Smart Edges**: Port-to-port connections with curved paths

## 🎯 Key Features

### Visual Design

- **Clean Node Styling**: Icon-focused design with colored indicators
- **Smart Edge Routing**: Connects input/output ports precisely
- **Hover & Selection**: Visual feedback with borders and effects
- **Database Glow**: Special icon glow effects for database nodes

### Interaction System

- **Immediate Selection**: Mouse down triggers node selection
- **Smooth Dragging**: Optimized drag performance with proper offset
- **Canvas Controls**: Zoom and pan with mouse/touch support
- **Port Connections**: Click-and-drag edge creation between ports

### Configuration Management

- **Dynamic Forms**: Auto-generated forms based on node type
- **Default Values**: Pre-populated configurations from node options
- **Type Validation**: Form validation based on field types
- **Real-time Updates**: Changes reflected immediately in workflow

## 🔄 Data Flow

### Node Creation

1. User selects category → node type → position type
2. System generates form based on node configuration schema
3. Default values auto-populated from node option definitions
4. New node created with complete configuration set

### Node Selection & Editing

1. Click selects node → right sidebar shows edit interface
2. Node type can be changed → form updates dynamically
3. Configuration changes → immediate state update
4. All changes persisted to localStorage automatically

### Edge Management

1. Drag from output port → temporary line follows cursor
2. Drop on input port → permanent edge created
3. Edge connects specific ports → precise visual routing
4. Delete edges → clean removal from state

## 🎨 Styling System

### Icon Colors

- Dynamic color mapping based on node type and category
- Fallback color system for consistent appearance
- Dark/light theme compatibility

### Hover States

- Border effects on node hover
- Selection rings for active nodes
- Smooth transitions for all interactive elements

### Database Effects

- Special glow animations for database icons
- Color-matched effects (blue/yellow/red variants)
- CSS-based animations for performance

## 🚀 Performance Features

### State Optimization

- Zustand with Immer for efficient updates
- Selective persistence (only essential data)
- Automatic cleanup of temporary UI state

### Canvas Performance

- Transform-based zoom/pan for smooth interactions
- Efficient coordinate conversion for mouse events
- Optimized SVG rendering for edges

### Component Efficiency

- Minimal re-renders through proper state structure
- Memoized calculations where appropriate
- Clean separation of concerns for better performance

## 📝 Usage

The workflow editor is a complete, self-contained system requiring no external configuration:

```typescript
import AnimatedWorkflowEditor from "@/components/AnimatedWorflowEditor";

export default function App() {
  return <AnimatedWorkflowEditor />;
}
```

### State Access

```typescript
import { useWorkflowStore } from "@/stores/workflowStore";

const nodes = useWorkflowStore((state) => state.nodes);
const addNode = useWorkflowStore((state) => state.addNode);
```
