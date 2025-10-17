/**
 * Zustand store types for workflow editor state management
 */

import { Node, Edge, TempLine, DragOffset } from "./workflow";
import { CanvasTransform } from "../canvas";

// Store state interface
export interface WorkflowState {
  // Core data
  nodes: Node[];
  edges: Edge[];

  // UI state
  selectedNode: number | null;
  draggingNode: number | null;
  dragOffset: DragOffset;
  connecting: number | null;
  tempLine: TempLine | null;

  // Simulation state
  requestsPerSecond: number;
  runCode: boolean;

  // Canvas state
  canvasTransform: CanvasTransform;
}

// Store actions interface
export interface WorkflowActions {
  // Node actions
  addNode: (nodeType?: {
    label: string;
    icon: string;
    type?: string;
    configurations?: Record<string, string | number | boolean>;
  }) => void;
  deleteNode: (id: number) => void;
  updateNode: (nodeId: number, updates: Partial<Node>) => void;
  updateNodePosition: (nodeId: number, x: number, y: number) => void;

  // Edge actions
  addEdge: (source: number, target: number) => void;
  deleteEdge: (edgeId: string) => void;

  // UI state setters
  setSelectedNode: (id: number | null) => void;
  setDraggingNode: (id: number | null) => void;
  setDragOffset: (offset: DragOffset) => void;
  setConnecting: (id: number | null) => void;
  setTempLine: (line: TempLine | null) => void;

  // Simulation setters
  setRequestsPerSecond: (value: number) => void;
  setRunCode: (value: boolean) => void;

  // Canvas actions
  setCanvasTransform: (transform: CanvasTransform) => void;
  updateCanvasTransform: (updates: Partial<CanvasTransform>) => void;

  // Bulk operations
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  // Utility actions
  reset: () => void;
  clearSelection: () => void;
}

// Combined store interface
export interface WorkflowStore extends WorkflowState, WorkflowActions {}

// Persistence configuration
export interface WorkflowPersistConfig {
  name: string;
  version: number;
  partialize?: (state: WorkflowStore) => Partial<WorkflowStore>;
  onRehydrateStorage?: () => void;
}
