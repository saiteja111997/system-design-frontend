import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Settings, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DockNavigation from "./DockNavigation";
import { sidebarDockItems } from "@/data/sidebarDockItems";
import {
  nodeTypeOptions,
  nodeCategories,
  nodePositionTypes,
} from "@/data/nodeTypeOptions";
import { Node } from "@/types/workflow-editor/workflow";
import {
  calculateServerLoad,
  getServerStatus,
  getLoadColor,
  getRPSColor,
} from "@/utils/serverMetrics";

interface SidebarRightProps {
  requestsPerSecond: number;
  onRequestsPerSecondChange: (value: number) => void;
  nodes?: Node[]; // Add nodes prop
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
  }) => void; // Add node handler with type info
  onUpdateNode?: (
    nodeId: number,
    updates: { label: string; icon: string }
  ) => void; // Update node handler
}

const SidebarRight: React.FC<SidebarRightProps> = ({
  requestsPerSecond,
  onRequestsPerSecondChange,
  nodes = [],
  onAddNode,
  onUpdateNode,
}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("add-node");
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");

  // Three-dropdown system for add node
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedNewNodeType, setSelectedNewNodeType] = useState<string>("");
  const [selectedPositionType, setSelectedPositionType] = useState<string>("");

  const handleToggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleDockItemClick = (itemId: string) => {
    setSelectedTab(itemId);
  };

  const handleAddNode = () => {
    if (selectedNewNodeType && selectedPositionType) {
      const nodeType = nodeTypeOptions.find(
        (type) => type.id === selectedNewNodeType
      );
      if (nodeType && onAddNode) {
        onAddNode({
          label: nodeType.label,
          icon: nodeType.icon,
          type: selectedPositionType, // Use selected position type
        });
      }
      // Reset all selections after adding
      setSelectedCategory("");
      setSelectedNewNodeType("");
      setSelectedPositionType("");
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // Reset node type selection when category changes
    setSelectedNewNodeType("");
    setSelectedPositionType("");
  };

  const handleNewNodeTypeChange = (nodeTypeId: string) => {
    setSelectedNewNodeType(nodeTypeId);
    // Reset position type when node type changes
    setSelectedPositionType("");
  };

  const handlePositionTypeChange = (positionType: string) => {
    setSelectedPositionType(positionType);
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(parseInt(nodeId));
  };

  const handleNodeTypeChange = (nodeTypeId: string) => {
    setSelectedNodeType(nodeTypeId);
    // Don't immediately update - wait for Done button click
  };

  const handleEditNodeDone = () => {
    const nodeType = nodeTypeOptions.find(
      (type) => type.id === selectedNodeType
    );
    if (selectedNodeId && nodeType && onUpdateNode) {
      onUpdateNode(selectedNodeId, {
        label: nodeType.label,
        icon: nodeType.icon,
      });
      // Reset selections after successful update
      setSelectedNodeId(null);
      setSelectedNodeType("");
    }
  };

  const getSelectedTabContent = () => {
    if (selectedTab === "add-node") {
      // Get filtered node types based on selected category
      const filteredNodeTypes = selectedCategory
        ? nodeTypeOptions.filter(
            (nodeType) => nodeType.category === selectedCategory
          )
        : [];

      // Check if all three dropdowns are selected
      const allSelectionsMade =
        selectedCategory && selectedNewNodeType && selectedPositionType;

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Add Node
          </h3>

          {/* Step 1: Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Step 1: Select Category
            </label>
            <Select
              onValueChange={handleCategoryChange}
              value={selectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent>
                {nodeCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Node Type Selection - Only show when category is selected */}
          {selectedCategory && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Step 2: Select Node Type
              </label>
              <Select
                onValueChange={handleNewNodeTypeChange}
                value={selectedNewNodeType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a node type..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {filteredNodeTypes.map((nodeType) => (
                    <SelectItem key={nodeType.id} value={nodeType.id}>
                      <div className="flex items-center gap-2 py-1">
                        {nodeType.component}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {nodeType.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {nodeType.category}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Position Type Selection - Only show when node type is selected */}
          {selectedNewNodeType && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Step 3: Select Position Type
              </label>
              <Select
                onValueChange={handlePositionTypeChange}
                value={selectedPositionType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose position type..." />
                </SelectTrigger>
                <SelectContent>
                  {nodePositionTypes.map((posType) => (
                    <SelectItem key={posType.id} value={posType.id}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {posType.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {posType.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Add Node Button - Only enabled when all selections are made */}
          <Button
            onClick={handleAddNode}
            disabled={!allSelectionsMade}
            className={`w-full ${
              allSelectionsMade
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            } transition-colors`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {allSelectionsMade ? "Add New Node" : "Complete All Steps First"}
          </Button>

          {/* Progress indicator */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Progress: {selectedCategory ? "1" : "0"}/3 steps completed
            {selectedNewNodeType && " → 2/3"}
            {selectedPositionType && " → 3/3 ✓"}
          </div>
        </div>
      );
    }
    if (selectedTab === "edit-node") {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Edit Node
          </h3>

          {/* Node Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Select Node to Edit:
            </label>
            <Select onValueChange={handleNodeSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a node..." />
              </SelectTrigger>
              <SelectContent>
                {nodes
                  .sort((a, b) => a.id - b.id)
                  .map((node) => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{node.label}</span>
                        <span className="text-slate-500 text-xs">Node{node.id}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Node Type Selection */}
          {selectedNodeId && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Change Node To:
              </label>
              <Select
                onValueChange={handleNodeTypeChange}
                value={selectedNodeType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new node type..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {nodeTypeOptions.map((nodeType) => (
                    <SelectItem key={nodeType.id} value={nodeType.id}>
                      <div className="flex items-center gap-2 py-1">
                        {nodeType.component}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {nodeType.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {nodeType.category}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Done Button - Only show when node type is selected */}
              {selectedNodeType && (
                <Button
                  onClick={handleEditNodeDone}
                  className="w-full bg-primary hover:bg-primary/70 text-white mt-3"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }

    const selectedItem = sidebarDockItems.find(
      (item) => item.id === selectedTab
    );
    return selectedItem?.content || null;
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
              Panel
            </h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">
              Tools & Settings
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Dock Navigation - only show when expanded */}
      {sidebarExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="px-4 pb-4"
        >
          <DockNavigation
            position="top"
            responsive="top"
            collapsible={false}
            items={sidebarDockItems}
            onItemClick={handleDockItemClick}
            className="relative"
            activeItem={selectedTab}
          />
        </motion.div>
      )}

      {/* Content area */}
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

        {/* Expanded content - selected tab content */}
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
              {/* Selected Tab Content */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                {getSelectedTabContent()}
              </div>

              {/* System Metrics - Only show for metrics tab */}
              {selectedTab === "metrics" && (
                <>
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
                      <div className="text-sm font-bold text-green-400">
                        Active
                      </div>
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
