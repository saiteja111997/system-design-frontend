import React, { forwardRef } from "react";
import { SvgDefinitions } from "./SvgDefinitions";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";
import { TempConnectionLine } from "./TempConnectionLine";
import { useWorkflowAnimation } from "@/hooks/useWorkflowAnimation";
import {
  Node,
  Edge,
  TempLine,
  NodeHandlers,
  EdgeHandlers,
} from "@/types/workflow-editor/workflow";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";

interface WorkflowLayerProps {
  nodes: Node[];
  edges: Edge[];
  tempLine: TempLine | null;
  selectedNode: number | null;
  draggingNode: number | null;
  nodeHandlers: NodeHandlers;
  edgeHandlers: EdgeHandlers;
  runCode?: boolean;
}

export const WorkflowLayer = forwardRef<HTMLDivElement, WorkflowLayerProps>(
  (
    {
      nodes,
      edges,
      tempLine,
      selectedNode,
      draggingNode,
      nodeHandlers,
      edgeHandlers,
      runCode = false,
    },
    ref
  ) => {
    const { globalAnimationStyle } = useWorkflowAnimation();
    const { getTransformStyle } = useCanvasControlsContext();

    return (
      <div
        ref={ref}
        className="absolute inset-0 w-full h-full"
        style={globalAnimationStyle}
      >
        {/* SVG for edges - no transform needed (parent handles it) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <SvgDefinitions />
          </defs>
          <g style={getTransformStyle()}>
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
                  runCode={runCode}
                />
              );
            })}

            {/* Temporary connection line */}
            {tempLine && <TempConnectionLine tempLine={tempLine} />}
          </g>
        </svg>

        {/* Transformable canvas content */}
        <div
          className="absolute inset-0 w-full h-full"
          style={getTransformStyle()}
        >
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
      </div>
    );
  }
);

WorkflowLayer.displayName = "WorkflowLayer";
