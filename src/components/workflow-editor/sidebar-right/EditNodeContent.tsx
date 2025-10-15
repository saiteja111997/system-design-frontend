import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
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
  getNodeTypeConfiguration,
  getDefaultConfigurationValues,
} from "@/data/nodeTypeOptions";
import { EditNodeContentProps } from "@/types/workflow-editor/sidebar-right";
import ConfigurationForm from "./ConfigurationForm";

const EditNodeContent: React.FC<EditNodeContentProps> = ({
  nodes,
  onUpdateNode,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");
  const [configurations, setConfigurations] = useState<
    Record<string, string | number | boolean>
  >({});

  // Load existing configurations when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((node) => node.id === selectedNodeId);
      if (selectedNode) {
        // If node has configurations, use them; otherwise use defaults for its current type
        if (selectedNode.configurations) {
          setConfigurations(selectedNode.configurations);
        } else {
          // Get the node's current type and load defaults
          const nodeType = nodeTypeOptions.find(
            (type) => type.label === selectedNode.label
          );
          if (nodeType) {
            const defaultValues = getDefaultConfigurationValues(nodeType.id);
            setConfigurations(defaultValues);
            setSelectedNodeType(nodeType.id);
          }
        }
      }
    } else {
      setConfigurations({});
    }
  }, [selectedNodeId, nodes]);

  // Load default configurations when node type changes
  useEffect(() => {
    if (selectedNodeType) {
      const defaultValues = getDefaultConfigurationValues(selectedNodeType);
      setConfigurations(defaultValues);
    }
  }, [selectedNodeType]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(parseInt(nodeId));
    setSelectedNodeType(""); // Reset node type when changing node
    setConfigurations({});
  };

  const handleNodeTypeChange = (nodeTypeId: string) => {
    setSelectedNodeType(nodeTypeId);
  };

  const handleConfigurationChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setConfigurations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditNodeDone = () => {
    const nodeType = nodeTypeOptions.find(
      (type) => type.id === selectedNodeType
    );
    if (selectedNodeId && nodeType && onUpdateNode) {
      onUpdateNode(selectedNodeId, {
        label: nodeType.label,
        icon: nodeType.icon,
        configurations: configurations,
      });
      // Reset selections after successful update
      setSelectedNodeId(null);
      setSelectedNodeType("");
      setConfigurations({});
    }
  };

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
                    <span>Node {node.id}</span>
                    <span className="text-slate-500">- {node.label}</span>
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
            Change Node Type:
          </label>
          <Select onValueChange={handleNodeTypeChange} value={selectedNodeType}>
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

          {/* Apply Changes Button */}
          {selectedNodeType && (
            <>
              {/* Configuration Form */}
              {(() => {
                const nodeConfig = getNodeTypeConfiguration(selectedNodeType);
                return (
                  nodeConfig && (
                    <div className="mt-4 space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Node Configuration
                      </h4>
                      <div className="border rounded-lg p-4 dark:border-gray-700">
                        <ConfigurationForm
                          configurations={nodeConfig}
                          values={configurations}
                          onChange={handleConfigurationChange}
                        />
                      </div>
                    </div>
                  )
                );
              })()}

              <Button
                onClick={handleEditNodeDone}
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-3"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EditNodeContent;
