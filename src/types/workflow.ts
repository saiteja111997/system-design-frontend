export type NodeType = "start" | "process" | "end";

// RPS Range definitions with better type safety
export enum RPSRange {
  LOW = "LOW", // 0-500 RPS
  MEDIUM = "MEDIUM", // 500-5000 RPS
  HIGH = "HIGH", // 5000-50000 RPS
}

// Glow types for components
export enum GlowType {
  NONE = "NONE",
  BLUE = "BLUE",
  YELLOW = "YELLOW",
  RED = "RED",
}

// Edge gradient types
export enum EdgeGradientType {
  BLUE = "url(#flowGradient)",
  YELLOW = "url(#flowGradientYellow)",
  RED = "url(#flowGradientRed)",
}

// Animation class types
export type EdgeAnimationClass =
  | "animated-edge"
  | "animated-edge-yellow"
  | "animated-edge-red";
export type NodeGlowClass =
  | "database-glow-blue"
  | "database-glow-yellow"
  | "database-glow-red"
  | "";

// RPS utility types
export type RPSValue = number;
export type AnimationDuration = number;

// Style configuration interfaces
export interface EdgeStyle {
  gradient: EdgeGradientType;
  className: EdgeAnimationClass;
}

export interface NodeGlowConfig {
  glowType: GlowType;
  className: NodeGlowClass;
}

export interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  type: NodeType;
}

export interface Edge {
  id: string;
  source: number;
  target: number;
}

export interface TempLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DragOffset {
  x: number;
  y: number;
}

export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: number | null;
  draggingNode: number | null;
  dragOffset: DragOffset;
  connecting: number | null;
  tempLine: TempLine | null;
}

export interface NodeHandlers {
  onMouseDown: (e: React.MouseEvent, nodeId: number) => void;
  onClick: (nodeId: number) => void;
  onStartConnection: (e: React.MouseEvent, nodeId: number) => void;
  onEndConnection: (e: React.MouseEvent, targetId: number) => void;
  onDelete: (nodeId: number) => void;
}

export interface EdgeHandlers {
  onDelete: (edgeId: string) => void;
}
