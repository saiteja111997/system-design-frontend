# Animated Workflow Editor - Component Architecture

## 📁 Project Structure

```
src/
├── components/
│   ├── AnimatedWorflowEditor.tsx           # Main component (orchestrator)
│   └── animated-workflow-editor/           # Child components folder
│       ├── index.ts                        # Barrel exports
│       ├── WorkflowHeader.tsx              # Header with title and add button
│       ├── WorkflowCanvas.tsx              # Main canvas container
│       ├── WorkflowFooter.tsx              # Footer with statistics
│       ├── WorkflowNode.tsx                # Individual node component
│       ├── WorkflowEdge.tsx                # Individual edge/connection
│       ├── CanvasGrid.tsx                  # Background grid pattern
│       ├── SvgDefinitions.tsx              # SVG gradients and styles
│       ├── TempConnectionLine.tsx          # Temporary connection line
│       ├── WorkflowEditorSummary.tsx       # System metrics dashboard
│       ├── GlowWrapper.tsx                 # Glow effect wrapper component
│       ├── useWorkflowState.ts             # State management hook
│       └── useWorkflowInteractions.ts      # Interaction handlers hook
├── contexts/
│   └── WorkflowContext.tsx                 # Context API for RPS state
├── hooks/
│   └── useWorkflowAnimation.ts             # Animation logic hooks
├── types/
│   └── workflow.ts                         # Enhanced TypeScript interfaces
├── utils/
│   ├── workflow.ts                         # Utility functions
│   ├── animationUtils.ts                   # Animation calculations
│   └── stylingUtils.ts                     # Styling utilities
└── styles/
    └── workflowAnimations.css              # CSS animations and effects
```

## 🏗️ Component Architecture

### Main Component

- **`AnimatedWorkflowEditor.tsx`**: Orchestrates the entire workflow editor
  - Wraps components with `WorkflowProvider` for Context API
  - Manages RPS (Requests Per Second) state
  - Coordinates interactions between child components
  - Provides a clean, minimal interface

### Context API

- **`WorkflowContext.tsx`**: Centralized state management using React Context
  - Manages global RPS (Requests Per Second) state
  - Provides `rpsRange` (LOW/MEDIUM/HIGH) based on RPS value
  - Calculates `globalGlowType` for animations (BLUE/YELLOW/RED)
  - Eliminates prop drilling across the component tree

### Child Components

#### Layout Components

- **`WorkflowHeader`**: Top header with title and "Add Node" button
- **`WorkflowCanvas`**: Main canvas area containing grid, SVG, and nodes
- **`WorkflowFooter`**: Bottom status bar with node/edge counts

#### Control Components

- **`WorkflowEditorSummary`**: Comprehensive system metrics dashboard
  - Real-time RPS input control with visual feedback
  - Server load percentage calculation and status indicators
  - System status monitoring with color-coded alerts
  - Motion state indicator and performance metrics

#### Core Components

- **`WorkflowNode`**: Individual draggable node with ports and content
  - Database nodes feature dynamic glow effects
  - Theme-aware styling with Tailwind CSS
  - Smooth drag interactions with optimized performance
- **`WorkflowEdge`**: SVG-based connection between nodes with animations
  - Dynamic colors based on RPS ranges (blue/yellow/red)
  - Animated flow effects with configurable speeds
  - Gradient effects and drop shadows
- **`TempConnectionLine`**: Temporary line shown while creating connections
  - Accurate cursor following with proper coordinate conversion
  - Visual feedback during connection creation

#### Utility Components

- **`CanvasGrid`**: Background grid pattern for visual alignment
- **`SvgDefinitions`**: Reusable SVG gradients, filters, and animations
- **`GlowWrapper`**: Composition component for applying glow effects

### Custom Hooks

#### State Management

- **`useWorkflowState`**: Manages all workflow state and provides actions
  - Node/edge collections
  - Selection and interaction states
  - CRUD operations for nodes and edges

#### Interaction Handling

- **`useWorkflowInteractions`**: Handles all user interactions
  - Mouse events for dragging and selection
  - Connection creation workflow
  - Node and edge manipulation

#### Animation Management

- **`useWorkflowAnimation`**: Manages dynamic animations and effects
  - **`useEdgeAnimation`**: Calculates edge animation durations and styles
  - **`useNodeAnimation`**: Handles node-specific animations
  - Integrates with Context API for RPS-based animations
  - Optimized with memoization for performance

### Types & Utilities

#### Type Definitions (`types/workflow.ts`)

- **Enhanced Interfaces**: `Node`, `Edge`, `TempLine`, `DragOffset`, `WorkflowState`
- **Handler Types**: `NodeHandlers`, `EdgeHandlers`
- **Enum Types**: `NodeType`, `RPSRange`, `GlowType`, `EdgeGradientType`
- **Union Types**: `RPSValue` for type-safe RPS values

#### Utility Functions

- **`utils/workflow.ts`**: Core workflow utilities

  - ID Generation: Unique ID creation for nodes and edges
  - Positioning: Random position generation for new nodes
  - Path Calculations: SVG curve path generation
  - Style Helpers: Dynamic CSS class generation
  - Validation: Edge existence checking

- **`utils/animationUtils.ts`**: Animation calculations

  - `calculateAnimationDuration`: RPS-based speed calculation
  - `getRPSRange`: Categorizes RPS into LOW/MEDIUM/HIGH ranges

- **`utils/stylingUtils.ts`**: Styling and visual effects
  - `getEdgeStyle`: Dynamic edge styling based on RPS
  - `shouldNodeGlow`: Database node glow logic
  - `getDatabaseGlowClass`: CSS class generation for glow effects

#### Styles (`styles/workflowAnimations.css`)

- **CSS Animations**: Keyframe animations for flow and glow effects
- **Dynamic Classes**: RPS-based styling with CSS variables
- **Theme Support**: Compatible with light/dark modes

## 🎯 Design Principles

### 1. **Separation of Concerns**

- Each component has a single, well-defined responsibility
- State management is centralized using Context API
- UI logic is separated from business logic
- Animation logic is isolated in dedicated hooks

### 2. **Context-Driven Architecture**

- **WorkflowContext**: Eliminates prop drilling for RPS state
- **Provider Pattern**: Centralized state management
- **Custom Hooks**: Easy context consumption with `useWorkflowContext`
- **Type Safety**: Strict TypeScript integration with Context API

### 3. **Performance Optimization**

- **Memoized Calculations**: Animation and styling computations
- **Efficient Updates**: Context state changes trigger minimal re-renders
- **Optimized Interactions**: Smooth dragging with coordinate precision
- **CSS Variables**: Dynamic animations without JavaScript overhead

### 4. **Reusability & Modularity**

- Utility functions can be used across components
- Child components are modular and reusable
- Custom hooks encapsulate complex logic
- Composition patterns for flexible component structures

### 5. **Type Safety**

- Comprehensive TypeScript interfaces with enums
- Proper prop typing for all components
- Type-safe event handlers and callbacks
- Enhanced type definitions for RPS ranges and glow types

### 6. **Maintainability**

- Clear component hierarchy and responsibilities
- Consistent naming conventions
- Comprehensive type definitions
- Modular architecture for easy testing
- Separated concerns with dedicated utility files

## 🔄 Data Flow

### Context-Based State Management

1. **Global State**: `WorkflowContext` manages RPS and derived states
2. **Local State**: Individual components maintain local UI state
3. **State Distribution**: Context eliminates prop drilling
4. **Type Safety**: All context interactions are type-safe

### Animation System

1. **RPS Input**: User adjusts requests per second (0-50,000)
2. **Range Calculation**: Context determines LOW/MEDIUM/HIGH range
3. **Style Application**: Components consume context for dynamic styling
4. **Animation Updates**: CSS animations respond to state changes

### Interaction Flow

1. **Event Capture**: Mouse/touch events captured by interaction hooks
2. **State Updates**: Local and context state updated accordingly
3. **Visual Feedback**: Components re-render with new styling
4. **Performance**: Optimized updates prevent unnecessary re-renders

## 🚀 Key Features

### Dynamic Animation System

- **RPS-Based Speed Control**: 0-500 (slow/blue), 500-5000 (medium/yellow), 5000-50000 (fast/red)
- **Real-Time Updates**: Animations respond instantly to RPS changes
- **Smooth Transitions**: CSS-based animations with optimized performance

### Advanced Visual Effects

- **Database Node Glow**: Animated border effects matching connection colors
- **Gradient Connections**: Dynamic SVG gradients based on RPS ranges
- **Theme Integration**: Full light/dark mode compatibility
- **Drop Shadow Effects**: Enhanced visual depth for connections

### Interaction Excellence

- **Precise Cursor Tracking**: Accurate temporary connection lines
- **Smooth Dragging**: Optimized node movement with minimal latency
- **Visual Feedback**: Real-time connection creation and selection states
- **Responsive Design**: Touch and mouse interaction support

### Architecture Benefits

- **Context API**: Centralized state management eliminates prop drilling
- **Type Safety**: Comprehensive TypeScript coverage with enums
- **Modular Design**: Easy to extend and maintain
- **Performance**: Memoized calculations and efficient re-rendering
- **Professional Code**: Clean architecture following React best practices

## 📝 Usage

```tsx
import AnimatedWorkflowEditor from "@/components/AnimatedWorflowEditor";

function App() {
  return <AnimatedWorkflowEditor />;
}
```

The component is fully self-contained and requires no additional props or setup. The Context API handles all internal state management automatically.

### Advanced Usage with Context

```tsx
import { useWorkflowContext } from "@/contexts/WorkflowContext";

function CustomComponent() {
  const { requestsPerSecond, rpsRange, globalGlowType } = useWorkflowContext();

  return (
    <div>
      <p>Current RPS: {requestsPerSecond}</p>
      <p>Load Level: {rpsRange}</p>
      <p>Animation Color: {globalGlowType}</p>
    </div>
  );
}
```

## 🎨 Customization

### RPS Ranges

- **LOW (0-500)**: Blue animations, slow speed
- **MEDIUM (500-5000)**: Yellow animations, medium speed
- **HIGH (5000-50000)**: Red animations, fast speed

### CSS Variables

Animation speeds can be customized via CSS variables:

```css
.animated-edge {
  --flow-animation-duration: var(--custom-duration, 2s);
}
```
