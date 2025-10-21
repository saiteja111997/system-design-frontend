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
} from "@/types/workflow-studio/workflow";

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

    // Calculate dynamic bounds for the SVG based on node positions
    const calculateSVGBounds = () => {
      if (nodes.length === 0) {
        return { minX: -1000, minY: -1000, maxX: 1000, maxY: 1000 };
      }

      const padding = 500; // Extra padding around content
      const nodeSize = 200; // Approximate node size for bounds calculation

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        minX = Math.min(minX, node.x - nodeSize / 2);
        minY = Math.min(minY, node.y - nodeSize / 2);
        maxX = Math.max(maxX, node.x + nodeSize / 2);
        maxY = Math.max(maxY, node.y + nodeSize / 2);
      });

      return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
      };
    };

    const bounds = calculateSVGBounds();
    const svgWidth = bounds.maxX - bounds.minX;
    const svgHeight = bounds.maxY - bounds.minY;

    return (
      <div
        ref={ref}
        className="absolute inset-0 w-full h-full"
        style={globalAnimationStyle}
      >
        {/* SVG for edges - transform handled by parent container */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: `${bounds.minX}px`,
            top: `${bounds.minY}px`,
            width: `${svgWidth}px`,
            height: `${svgHeight}px`,
          }}
          viewBox={`${bounds.minX} ${bounds.minY} ${svgWidth} ${svgHeight}`}
        >
          <defs>
            <SvgDefinitions />
          </defs>
          <g>
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

        {/* Canvas content - transform handled by parent container */}
        <div className="absolute inset-0 w-full h-full">
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
