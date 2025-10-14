import React from "react";
import { motion } from "framer-motion";
import {
  calculateServerLoad,
  getLoadColor,
  getRPSColor,
} from "@/utils/serverMetrics";
import { CollapsedStateProps } from "@/types/workflow-editor/sidebar-right";

const CollapsedState: React.FC<CollapsedStateProps> = ({
  requestsPerSecond,
}) => {
  const serverLoad = calculateServerLoad(requestsPerSecond);
  const rpsColorClass = getRPSColor(requestsPerSecond);

  return (
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
  );
};

export default CollapsedState;
