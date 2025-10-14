import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  nodeTypeOptions,
  nodeCategories,
  nodePositionTypes,
} from "@/data/nodeTypeOptions";
import { AddNodeContentProps } from "@/types/workflow-editor/sidebar-right";

const AddNodeContent: React.FC<AddNodeContentProps> = ({ onAddNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedNewNodeType, setSelectedNewNodeType] = useState<string>("");
  const [selectedPositionType, setSelectedPositionType] = useState<string>("");

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedNewNodeType("");
    setSelectedPositionType("");
  };

  const handleNewNodeTypeChange = (nodeTypeId: string) => {
    setSelectedNewNodeType(nodeTypeId);
    setSelectedPositionType("");
  };

  const handlePositionTypeChange = (positionType: string) => {
    setSelectedPositionType(positionType);
  };

  const handleAddNode = () => {
    if (selectedNewNodeType && selectedPositionType) {
      const nodeType = nodeTypeOptions.find(
        (type) => type.id === selectedNewNodeType
      );

      if (nodeType && onAddNode) {
        const nodeData = {
          label: nodeType.label,
          icon: nodeType.icon,
          type: selectedPositionType,
        };

        onAddNode(nodeData);
      }

      // Reset all selections after adding
      setSelectedCategory("");
      setSelectedNewNodeType("");
      setSelectedPositionType("");
    }
  };

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
        <Select onValueChange={handleCategoryChange} value={selectedCategory}>
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

      {/* Step 2: Node Type Selection */}
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

      {/* Step 3: Position Type Selection */}
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
                    <span className="text-sm font-medium">{posType.label}</span>
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

      {/* Add Node Button */}
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
};

export default AddNodeContent;
