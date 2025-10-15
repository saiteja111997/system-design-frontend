import React from "react";
import { motion } from "framer-motion";
import DockNavigation from "../DockNavigation";
import { sidebarDockItems } from "@/data/sidebarDockItems";
import {
  calculateServerLoad,
  getLoadColor,
  getRPSColor,
} from "@/utils/serverMetrics";
import { CollapsedStateProps } from "@/types/workflow-editor/sidebar-right";

const CollapsedState: React.FC<CollapsedStateProps> = ({
  requestsPerSecond,
  onTabChange,
}) => {
  const serverLoad = calculateServerLoad(requestsPerSecond);
  const rpsColorClass = getRPSColor(requestsPerSecond);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center space-y-4"
    >
      {/* Vertical Navigation */}
      <div className="mb-4">
        <DockNavigation
          direction="vertical"
          tooltipPosition="left"
          collapsible={false}
          items={sidebarDockItems}
          onItemClick={onTabChange}
          activeItem={null} // No active item when collapsed
        />
      </div>
    </motion.div>
  );
};

export default CollapsedState;
