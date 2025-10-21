import React from "react";
import { WorkflowEdgeProps } from "@/types/workflow-studio";
import { calculatePortToPortPath } from "@/utils/workflow";
import { useEdgeAnimation } from "@/hooks/useWorkflowAnimation";
import "@/styles/workflowAnimations.css";

export const WorkflowEdge: React.FC<WorkflowEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
  handlers,
  runCode = false, // Add runCode prop with default false
}) => {
  const path = calculatePortToPortPath(
    sourceNode.x,
    sourceNode.y,
    targetNode.x,
    targetNode.y
  );

  const { edgeStyle, animationStyle } = useEdgeAnimation();

  return (
    <g style={animationStyle}>
      {/* Background line */}
      <path
        d={path}
        stroke={runCode ? "var(--edge-bg-stroke)" : "#8851e0"}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        onClick={() => handlers.onDelete(edge.id)}
        style={{ cursor: "pointer" }}
        className="hover:stroke-red-500/50 transition-colors"
      />

      {/* Animated flowing line - only render if runCode is true */}
      {runCode && (
        <path
          d={path}
          className={edgeStyle.className}
          stroke={edgeStyle.gradient}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
};
