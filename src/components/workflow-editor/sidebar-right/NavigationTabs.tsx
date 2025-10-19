import React from "react";
import { motion } from "framer-motion";
import DockNavigation from "../DockNavigation";
import { sidebarDockItems } from "@/data/sidebarDockItems";
import { NavigationTabsProps } from "@/types/workflow-editor/sidebar-right";

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  sidebarExpanded,
  selectedTab,
  onTabChange,
}) => {
  if (!sidebarExpanded) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-4 overflow-hidden"
    >
      <DockNavigation
        position="top"
        responsive="top"
        collapsible={false}
        items={sidebarDockItems}
        onItemClick={onTabChange}
        activeItem={selectedTab}
        className="relative"
      />
    </motion.div>
  );
};

export default NavigationTabs;
