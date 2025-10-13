import React from "react";
import { Input } from "@/components/ui/input";
import { WorkflowEditorSummaryProps } from "@/types/workflow-editor/components";
import {
  calculateServerLoad,
  getServerStatus,
  getLoadColor,
  getRPSColor,
} from "@/utils/serverMetrics";

export const WorkflowEditorSummary: React.FC<WorkflowEditorSummaryProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(
      0,
      Math.min(50000, parseInt(e.target.value) || 0)
    );
    onChange(newValue);
  };

  const serverLoad = calculateServerLoad(value);
  const { status, statusClass, iconClass } = getServerStatus(serverLoad);
  const rpsColorClass = getRPSColor(value);

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">System Metrics</h3>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* RPS Input Control */}
        <div className="col-span-2 bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <label
            htmlFor="rps-input"
            className="block text-xs font-medium text-cyan-400 mb-2 uppercase tracking-wide"
          >
            REQUESTS/SEC
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="rps-input"
              type="number"
              min="0"
              max="50000"
              value={value}
              onChange={handleChange}
              className="flex-1 bg-slate-900 border-slate-600 text-white text-center text-lg font-mono"
            />
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400">▲</span>
              <span className="text-xs text-slate-400">▼</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">0-1000, press Enter</div>
        </div>

        {/* Current RPS Display */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${rpsColorClass} animate-pulse`}
            ></div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              REQUESTS/S
            </span>
          </div>
          <div className={`text-xl font-bold font-mono ${rpsColorClass}`}>
            {value.toLocaleString()}
          </div>
        </div>

        {/* Server Load */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-4 h-4 rounded border border-red-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              SERVER LOAD
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              getLoadColor(serverLoad).split(" ")[0]
            }`}
          >
            {serverLoad}%
          </div>
        </div>

        {/* Status */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div
              className={`w-4 h-4 rounded-full border-2 ${iconClass} flex items-center justify-center`}
            >
              <div
                className={`w-2 h-2 rounded-full ${iconClass.replace(
                  "text-",
                  "bg-"
                )}`}
              ></div>
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              STATUS
            </span>
          </div>
          <div className={`text-lg font-bold ${statusClass}`}>{status}</div>
        </div>

        {/* Motion Indicator */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Motion
            </span>
          </div>
          <div className="text-lg font-bold text-green-400">On</div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-700 flex items-center justify-between">
        <div className="text-xs text-slate-500">Max: 50,000 RPS</div>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <span className="font-mono">⚡</span>
          <span>Made with custom code</span>
        </div>
      </div>
    </div>
  );
};
