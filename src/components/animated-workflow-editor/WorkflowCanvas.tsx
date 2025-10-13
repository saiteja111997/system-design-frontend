import React, { forwardRef } from "react";
import {
  Node,
  Edge,
  TempLine,
  NodeHandlers,
  EdgeHandlers,
} from "@/types/workflow";
import { CanvasGrid } from "./CanvasGrid";
import { SvgDefinitions } from "./SvgDefinitions";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";
import { TempConnectionLine } from "./TempConnectionLine";
import { useWorkflowAnimation } from "@/hooks/useWorkflowAnimation";

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  tempLine: TempLine | null;
  selectedNode: number | null;
  draggingNode: number | null;
  nodeHandlers: NodeHandlers;
  edgeHandlers: EdgeHandlers;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  (
    {
      nodes,
      edges,
      tempLine,
      selectedNode,
      draggingNode,
      nodeHandlers,
      edgeHandlers,
      onMouseMove,
      onMouseUp,
    },
    ref
  ) => {
    const { globalAnimationStyle } = useWorkflowAnimation();

    return (
      <div
        ref={ref}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        style={globalAnimationStyle}
      >
        <CanvasGrid />

        {/* SVG for edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <SvgDefinitions />

          {/* Existing edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            return (
              <WorkflowEdge
                key={edge.id}
                edge={edge}
                sourceNode={sourceNode}
                targetNode={targetNode}
                handlers={edgeHandlers}
              />
            );
          })}

          {/* Temporary connection line */}
          {tempLine && <TempConnectionLine tempLine={tempLine} />}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isDragging={draggingNode === node.id}
            handlers={nodeHandlers}
          />
        ))}
      </div>
    );
  }
);

WorkflowCanvas.displayName = "WorkflowCanvas";
