import React from "react";
import { motion } from "framer-motion";
import AddNodeContent from "./AddNodeContent";
import EditNodeContent from "./EditNodeContent";
import AnalyticsContent from "./AnalyticsContent";
import MetricsContent from "./MetricsContent";
import CollapsedState from "./CollapsedState";
import { sidebarDockItems } from "@/data/sidebarDockItems";
import { MainContentAreaProps } from "@/types/workflow-editor/sidebar-right";

const MainContentArea: React.FC<MainContentAreaProps> = ({
  sidebarExpanded,
  selectedTab,
  nodes,
  onAddNode,
  onUpdateNode,
  requestsPerSecond,
  onRequestsPerSecondChange,
  onTabChange,
}) => {
  const getSelectedTabContent = () => {
    if (!selectedTab) {
      return null; // No content when no tab is selected
    }

    switch (selectedTab) {
      case "add-node":
        return <AddNodeContent onAddNode={onAddNode} />;

      case "edit-node":
        return <EditNodeContent nodes={nodes} onUpdateNode={onUpdateNode} />;

      case "analytics":
        return <AnalyticsContent />;

      case "metrics":
        return (
          <MetricsContent
            requestsPerSecond={requestsPerSecond}
            onRequestsPerSecondChange={onRequestsPerSecondChange}
          />
        );

      default:
        // Find the dock item content for other tabs
        const selectedItem = sidebarDockItems.find(
          (item) => item.id === selectedTab
        );
        return selectedItem?.content || null;
    }
  };

  return (
    <div className="flex-1 p-4 relative overflow-hidden">
      {/* Collapsed State */}
      {!sidebarExpanded && <CollapsedState onTabChange={onTabChange} />}

      {/* Expanded Content */}
      {sidebarExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.25,
            ease: "easeOut",
          }}
          className="space-y-4 h-full overflow-y-auto"
        >
          {/* Selected Tab Content */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 min-h-0">
            {getSelectedTabContent()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MainContentArea;
