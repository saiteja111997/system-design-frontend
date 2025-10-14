import React from "react";
import {
  Node,
  Edge,
  TempLine,
  NodeHandlers,
  EdgeHandlers,
  GlowType,
  DragOffset,
} from "./workflow";

// Canvas Component Props
export interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  tempLine: TempLine | null;
  selectedNode: number | null;
  draggingNode: number | null;
  nodeHandlers: NodeHandlers;
  edgeHandlers: EdgeHandlers;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  runCode?: boolean; // Optional prop to control edge animations
}

// Node Component Props
export interface WorkflowNodeProps {
  node: Node;
  isSelected: boolean;
  isDragging: boolean;
  handlers: NodeHandlers;
}

// Edge Component Props
export interface WorkflowEdgeProps {
  edge: Edge;
  sourceNode: Node;
  targetNode: Node;
  handlers: EdgeHandlers;
  runCode?: boolean; // Optional prop to control animation
}

// Temp Connection Line Props
export interface TempConnectionLineProps {
  tempLine: TempLine;
}

// Header Component Props
export interface WorkflowHeaderProps {
  onAddNode: () => void;
}

// Footer Component Props
export interface WorkflowFooterProps {
  nodeCount: number;
  edgeCount: number;
}

// Glow Wrapper Props
export interface GlowWrapperProps {
  children: React.ReactNode;
  glowType: GlowType;
  className?: string;
  enabled?: boolean;
}

export interface DatabaseGlowWrapperProps {
  children: React.ReactNode;
  glowType: GlowType;
  className?: string;
}

// Hook Props
export interface UseWorkflowInteractionsProps {
  nodes: Node[];
  draggingNode: number | null;
  connecting: number | null;
  dragOffset: DragOffset;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  setSelectedNode: (id: number | null) => void;
  setDraggingNode: (id: number | null) => void;
  setDragOffset: (offset: DragOffset) => void;
  setConnecting: (id: number | null) => void;
  setTempLine: (line: TempLine | null) => void;
  updateNodePosition: (nodeId: number, x: number, y: number) => void;
  addEdge: (source: number, target: number) => void;
  deleteNode: (id: number) => void;
}

// Workflow Editor Summary Props
export interface WorkflowEditorSummaryProps {
  value: number;
  onChange: (value: number) => void;
}
