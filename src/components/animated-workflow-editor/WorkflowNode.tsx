import React from "react";
import { Trash2 } from "lucide-react";
import { Node, NodeHandlers } from "@/types/workflow";
import {
  getNodeClasses,
  getNodeTextClasses,
  getNodeSecondaryTextClasses,
} from "@/utils/workflow";
import { useNodeAnimation } from "@/hooks/useWorkflowAnimation";
import { shouldNodeGlow } from "@/utils/stylingUtils";
import "@/styles/workflowAnimations.css";

interface WorkflowNodeProps {
  node: Node;
  isSelected: boolean;
  isDragging: boolean;
  handlers: NodeHandlers;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  isDragging,
  handlers,
}) => {
  const { glowConfig } = useNodeAnimation(node.label);
  const nodeNeedsGlow = shouldNodeGlow(node.label);

  // Get the glow class directly for Database nodes
  const glowClassName = nodeNeedsGlow ? glowConfig.className : "";

  return (
    <div
      onMouseDown={(e) => handlers.onMouseDown(e, node.id)}
      onClick={() => handlers.onClick(node.id)}
      className={`${getNodeClasses(
        node.type,
        isSelected,
        isDragging
      )} ${glowClassName}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 50 : 10,
      }}
    >
      {/* Input port (for connections) */}
      <div
        onMouseUp={(e) => handlers.onEndConnection(e, node.id)}
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full cursor-crosshair shadow-lg hover:shadow-green-500/60 hover:scale-110 transition-all border-2 border-white dark:border-slate-900 hover:border-green-300"
        title="Drop connection here"
      />

      {/* Output port (for connections) */}
      <div
        onMouseDown={(e) => handlers.onStartConnection(e, node.id)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full cursor-crosshair shadow-lg hover:shadow-blue-500/60 hover:scale-110 transition-all border-2 border-white dark:border-slate-900 hover:border-blue-300"
        title="Drag to connect"
      />

      {/* Node content */}
      <div className="p-4 text-center">
        <p
          className={`font-bold text-sm truncate ${getNodeTextClasses(
            node.type
          )}`}
        >
          {node.label}
        </p>
        <p className={`text-xs mt-2 ${getNodeSecondaryTextClasses(node.type)}`}>
          ID: {node.id}
        </p>
      </div>

      {/* Delete button */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onDelete(node.id);
          }}
          className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-all shadow-lg hover:shadow-red-500/50 hover:scale-110"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};
