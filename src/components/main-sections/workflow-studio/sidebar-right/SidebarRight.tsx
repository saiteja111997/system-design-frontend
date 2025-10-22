import React from "react";
import { motion } from "framer-motion";
import {
  SidebarHeader,
  NavigationTabs,
  MainContentArea,
  ToggleButton,
  FooterSettings,
} from ".";
import { SidebarRightProps } from "@/types/workflow-studio/sidebar-right";
import { useWorkflowStore } from "@/stores/workflowStore";

const SidebarRight: React.FC<SidebarRightProps> = ({
  requestsPerSecond,
  onRequestsPerSecondChange,
  nodes = [],
  onAddNode,
  onUpdateNode,
}) => {
  // Use Zustand store for sidebar state instead of local state
  const sidebarExpanded = useWorkflowStore(
    (state) => state.sidebarRightExpanded
  );
  const setSidebarExpanded = useWorkflowStore(
    (state) => state.setSidebarRightExpanded
  );
  const selectedTab = useWorkflowStore((state) => state.selectedTab);
  const setSelectedTab = useWorkflowStore((state) => state.setSelectedTab);

  const handleToggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
    // When expanding sidebar, set default tab if none selected
    if (!sidebarExpanded && !selectedTab) {
      setSelectedTab("add-node");
    }
    // When collapsing sidebar, reset selected tab
    if (sidebarExpanded) {
      setSelectedTab(null);
    }
  };

  const handleDockItemClick = (itemId: string) => {
    setSelectedTab(itemId);
    // If sidebar is collapsed, expand it when an item is clicked
    if (!sidebarExpanded) {
      setSidebarExpanded(true);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarExpanded ? 340 : 74,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute right-0 top-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-30 overflow-visible"
    >
      {/* Header */}
      <SidebarHeader sidebarExpanded={sidebarExpanded} />

      {/* Navigation Tabs */}
      <NavigationTabs
        sidebarExpanded={sidebarExpanded}
        selectedTab={selectedTab}
        onTabChange={handleDockItemClick}
      />

      {/* Main Content Area */}
      <MainContentArea
        sidebarExpanded={sidebarExpanded}
        selectedTab={selectedTab}
        nodes={nodes}
        onAddNode={onAddNode}
        onUpdateNode={onUpdateNode}
        requestsPerSecond={requestsPerSecond}
        onRequestsPerSecondChange={onRequestsPerSecondChange}
        onTabChange={handleDockItemClick}
      />

      {/* Footer Settings */}
      <FooterSettings sidebarExpanded={sidebarExpanded} />

      {/* Toggle Button */}
      <ToggleButton
        sidebarExpanded={sidebarExpanded}
        onToggle={handleToggleSidebar}
      />
    </motion.aside>
  );
};

export default SidebarRight;
