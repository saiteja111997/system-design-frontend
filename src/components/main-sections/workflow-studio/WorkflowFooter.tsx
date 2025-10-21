import React from "react";
import { WorkflowFooterProps } from "@/types/workflow-studio";

export const WorkflowFooter: React.FC<WorkflowFooterProps> = ({
  nodeCount,
  edgeCount,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-slate-900 border-t border-gray-300 dark:border-slate-700 px-8 py-4 text-sm text-gray-600 dark:text-slate-400 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span>
          📍 Nodes:{" "}
          <span className="text-blue-500 dark:text-blue-400 font-semibold">
            {nodeCount}
          </span>
        </span>
        <span>
          🔗 Connections:{" "}
          <span className="text-blue-500 dark:text-blue-400 font-semibold">
            {edgeCount}
          </span>
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-slate-500">
        Drag node output port (blue circle) to create connections • Click
        connection to delete
      </div>
    </div>
  );
};
