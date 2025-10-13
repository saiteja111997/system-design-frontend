import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateServerLoad,
  getServerStatus,
  getLoadColor,
  getRPSColor,
} from "@/utils/serverMetrics";

interface SidebarRightProps {
  requestsPerSecond: number;
  onRequestsPerSecondChange: (value: number) => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({
  requestsPerSecond,
  onRequestsPerSecondChange,
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleRPSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(
      0,
      Math.min(50000, parseInt(e.target.value) || 0)
    );
    onRequestsPerSecondChange(newValue);
  };

  const serverLoad = calculateServerLoad(requestsPerSecond);
  const { status, statusClass, iconClass } = getServerStatus(serverLoad);
  const rpsColorClass = getRPSColor(requestsPerSecond);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarExpanded ? 284 : 74, // Same as SidebarLeft: expanded 284px, collapsed 74px
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute right-0 top-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-30"
    >
      {/* Header - matches SidebarLeft pattern */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center"
      >
        <motion.div
          initial={false}
          animate={{ scale: sidebarExpanded ? 1 : 1 }}
          className={`flex items-center ${sidebarExpanded ? "gap-3" : "gap-0"}`}
        >
          <div className="w-11 h-11 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: sidebarExpanded ? 1 : 0,
              width: sidebarExpanded ? "auto" : 0,
              x: sidebarExpanded ? 0 : -20,
            }}
            transition={{
              duration: 0.25,
              delay: sidebarExpanded ? 0.1 : 0,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <h1 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Properties
            </h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">
              Node & Edge Settings
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content area - System Metrics */}
      <div className="flex-1 p-4 relative overflow-y-auto">
        {/* Collapsed state - show minimal metrics */}
        {!sidebarExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-4"
          >
            {/* RPS indicator */}
            <div className="text-center">
              <div
                className={`w-3 h-3 rounded-full ${rpsColorClass} animate-pulse mx-auto mb-1`}
              ></div>
              <div className={`text-xs font-mono ${rpsColorClass}`}>
                {Math.round(requestsPerSecond / 1000)}K
              </div>
            </div>

            {/* Server load indicator */}
            <div className="text-center">
              <div className="w-3 h-3 rounded border border-red-500 flex items-center justify-center mx-auto mb-1">
                <div className="w-1 h-1 bg-red-500 rounded-sm"></div>
              </div>
              <div
                className={`text-xs font-mono ${
                  getLoadColor(serverLoad).split(" ")[0]
                }`}
              >
                {serverLoad}%
              </div>
            </div>
          </motion.div>
        )}

        {/* Expanded content - full system metrics */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{
            opacity: sidebarExpanded ? 1 : 0,
            x: sidebarExpanded ? 0 : -30,
          }}
          transition={{
            duration: 0.3,
            delay: sidebarExpanded ? 0.4 : 0,
            ease: "easeOut",
          }}
          className="space-y-4"
        >
          {sidebarExpanded && (
            <>
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  System Metrics
                </h3>
              </div>

              {/* RPS Input Control */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                <label
                  htmlFor="rps-input"
                  className="block text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wide"
                >
                  REQUESTS/SEC
                </label>
                <Input
                  id="rps-input"
                  type="number"
                  min="0"
                  max="50000"
                  value={requestsPerSecond}
                  onChange={handleRPSChange}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-center text-sm font-mono"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  0-50,000 range
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Current RPS Display */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${rpsColorClass} animate-pulse`}
                    ></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      REQUESTS/S
                    </span>
                  </div>
                  <div
                    className={`text-lg font-bold font-mono ${rpsColorClass}`}
                  >
                    {requestsPerSecond.toLocaleString()}
                  </div>
                </div>

                {/* Server Load */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded border border-red-500 flex items-center justify-center">
                      <div className="w-1 h-1 bg-red-500 rounded-sm"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      SERVER LOAD
                    </span>
                  </div>
                  <div
                    className={`text-lg font-bold font-mono ${
                      getLoadColor(serverLoad).split(" ")[0]
                    }`}
                  >
                    {serverLoad}%
                  </div>
                </div>

                {/* Status */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${iconClass} flex items-center justify-center`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${iconClass.replace(
                          "text-",
                          "bg-"
                        )}`}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      STATUS
                    </span>
                  </div>
                  <div className={`text-sm font-bold ${statusClass}`}>
                    {status}
                  </div>
                </div>

                {/* Motion Indicator */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      MOTION
                    </span>
                  </div>
                  <div className="text-sm font-bold text-green-400">Active</div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-xs text-slate-500">Max: 50K RPS</div>
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <span className="font-mono">⚡</span>
                  <span>Live</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom Settings Section - matches SidebarLeft nav pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="p-4 px-3 border-t border-slate-200 dark:border-slate-800"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button
            variant="ghost"
            className={`h-11 w-full rounded-xl ${
              sidebarExpanded
                ? "justify-start gap-3 px-4"
                : "justify-center gap-0 px-0"
            } hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
          >
            <Settings className="w-5 h-5 flex-shrink-0 text-slate-600 dark:text-slate-400" />
            <motion.span
              initial={false}
              animate={{
                opacity: sidebarExpanded ? 1 : 0,
                width: sidebarExpanded ? "auto" : 0,
                x: sidebarExpanded ? 0 : -10,
              }}
              transition={{
                duration: 0.25,
                delay: sidebarExpanded ? 0.1 : 0,
                ease: "easeInOut",
              }}
              className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300 overflow-hidden"
            >
              Settings
            </motion.span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Toggle button - positioned on the left side of right sidebar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleSidebar}
        className="absolute -left-3 top-24 h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      >
        {sidebarExpanded ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </motion.aside>
  );
};

export default SidebarRight;
