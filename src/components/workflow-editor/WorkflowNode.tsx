import React from "react";
import {
  Trash2,
  Smartphone,
  Router,
  Users,
  ShoppingCart,
  CreditCard,
  Network,
  Server,
  Database,
  Globe,
  Shield,
  Search,
  HardDrive,
  Zap,
  Monitor,
  Activity,
  Link,
  Circle,
} from "lucide-react";
import { WorkflowNodeProps } from "@/types/workflow-editor/components";
import { getNodeClasses, getNodeTextClasses } from "@/utils/workflow";
import { useNodeAnimation } from "@/hooks/useWorkflowAnimation";
import { shouldNodeGlow } from "@/utils/stylingUtils";
import "@/styles/workflowAnimations.css";

// Icon mapping for dynamic icon rendering
const getIconComponent = (iconName: string) => {
  const iconMap = {
    Smartphone,
    Router,
    Users,
    ShoppingCart,
    CreditCard,
    Network,
    Server,
    Database,
    Globe,
    Shield,
    Search,
    HardDrive,
    Zap,
    Monitor,
    Activity,
    Link,
    Circle,
  };
  return iconMap[iconName as keyof typeof iconMap] || Circle;
};

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

  // Get the icon component
  const IconComponent = getIconComponent(node.icon);

  return (
    <div
      onMouseDown={(e) => handlers.onMouseDown(e, node.id)}
      onClick={() => handlers.onClick(node.id)}
      className={`workflow-node ${getNodeClasses(
        node.type,
        isSelected,
        isDragging
      )} ${glowClassName}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 50 : 10,
        width: "55px",
        height: "55px",
        minWidth: "55px",
        minHeight: "55px",
      }}
    >
      {/* Input port (for connections) - smaller */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => {
          e.stopPropagation();
          handlers.onEndConnection(e, node.id);
        }}
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full cursor-crosshair shadow-md hover:shadow-green-500/60 hover:scale-110 transition-all border border-white dark:border-slate-900"
        title="Drop connection here"
      />

      {/* Output port (for connections) - smaller */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          handlers.onStartConnection(e, node.id);
        }}
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full cursor-crosshair shadow-md hover:shadow-blue-500/60 hover:scale-110 transition-all border border-white dark:border-slate-900"
        title="Drag to connect"
      />

      {/* Node content - compact with icon on top */}
      <div className="flex flex-col items-center justify-center h-full p-1">
        <IconComponent
          size={14}
          className={`${getNodeTextClasses(node.type)} mb-1`}
        />
        <p
          className={`text-[8px] font-medium text-center leading-tight ${getNodeTextClasses(
            node.type
          )}`}
        >
          {node.label}
        </p>
      </div>

      {/* Delete button - smaller */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onDelete(node.id);
          }}
          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-all shadow-md hover:shadow-red-500/50 hover:scale-110"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};
