import React from "react";
import { WorkflowEdgeProps } from "@/types/workflow-editor/components";
import { calculateCurvePath } from "@/utils/workflow";
import { useEdgeAnimation } from "@/hooks/useWorkflowAnimation";
import "@/styles/workflowAnimations.css";

export const WorkflowEdge: React.FC<WorkflowEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
  handlers,
}) => {
  const path = calculateCurvePath(
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
        stroke="var(--edge-bg-stroke)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        onClick={() => handlers.onDelete(edge.id)}
        style={{ cursor: "pointer" }}
        className="hover:stroke-red-500/50 transition-colors"
      />

      {/* Animated flowing line */}
      <path
        d={path}
        className={edgeStyle.className}
        stroke={edgeStyle.gradient}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arrow */}
      <path
        d={path}
        stroke="none"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        opacity="0.6"
      />
    </g>
  );
};
