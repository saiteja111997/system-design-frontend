import { Plus, Edit3, BarChart3, Activity, Sparkles } from "lucide-react";
import { SidebarRightItem } from "@/types/workflow-studio/sidebar-right";

export const sidebarRightItems: SidebarRightItem[] = [
  {
    id: "add-node",
    name: "Add Node",
    tooltip: "Add Node",
    component: <Plus size={16} className="text-slate-700 dark:text-white" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Add Node
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Add a new node to the workflow canvas.
        </p>
      </div>
    ),
  },
  {
    id: "edit-node",
    name: "Edit Node",
    tooltip: "Edit Node",
    component: <Edit3 size={16} className="text-slate-700 dark:text-white" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Edit Node
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select and modify existing nodes in the workflow.
        </p>
      </div>
    ),
  },
  {
    id: "selected-edge/node",
    name: "Selected Edge/Node",
    tooltip: "Selected Edge/Node",
    component: (
      <BarChart3 size={16} className="text-slate-700 dark:text-white" />
    ),
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Selected Edge/Node
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          View detailed metrics and configuration for the selected edge or node.
        </p>
      </div>
    ),
  },
  {
    id: "metrics",
    name: "Metrics",
    tooltip: "System Metrics",
    component: (
      <Activity size={16} className="text-slate-700 dark:text-white" />
    ),
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          System Metrics
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Monitor real-time system performance, request rates, server load, and
          operational status.
        </p>
      </div>
    ),
  },

  {
    id: "ai-assistant",
    name: "AI Assistant",
    tooltip: "AI Assistant",
    component: (
      <Sparkles size={16} className="text-slate-700 dark:text-white" />
    ),
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          AI Assistant
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Get real-time suggestions and assistance for your workflow.
        </p>
      </div>
    ),
  },
];
