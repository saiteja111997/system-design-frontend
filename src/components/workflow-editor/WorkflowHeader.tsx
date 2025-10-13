import React from "react";
import { Plus } from "lucide-react";
import { WorkflowHeaderProps } from "@/types/workflow-editor/components";

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  onAddNode,
}) => {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-950 dark:to-slate-950 border-b border-gray-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
          System Design Workflow Editor
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
          Drag nodes • Drag from output to create connections • Click to select
        </p>
      </div>
      <button
        onClick={onAddNode}
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 font-semibold"
      >
        <Plus size={20} />
        Add Node
      </button>
    </div>
  );
};
