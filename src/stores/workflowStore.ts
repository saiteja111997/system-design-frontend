/**
 * Zustand store for workflow editor state management
 * Features: localStorage persistence, clean API, optimized performance
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Node, NodeType } from "@/types/workflow-editor/workflow";
import { WorkflowStore, WorkflowState } from "@/types/workflow-editor/store";
import {
  generateNodeId,
  generateEdgeId,
  generateRandomPosition,
  edgeExists,
  filterEdgesForNode,
} from "@/utils/workflow";
import {
  nodeTypeOptions,
  getDefaultConfigurationValues,
} from "@/data/nodeTypeOptions";

// Initial state data (same as before)
const getInitialNodes = (): Node[] => {
  const baseNodes: Node[] = [
    // Client
    {
      id: 1,
      label: "Client",
      x: 160,
      y: 330,
      type: "start",
      icon: "Smartphone",
    },
    // API Gateway
    {
      id: 2,
      label: "Gateway",
      x: 320,
      y: 330,
      type: "process",
      icon: "Router",
    },
    // Services Layer
    {
      id: 3,
      label: "User Service",
      x: 480,
      y: 140,
      type: "process",
      icon: "Users",
    },
    {
      id: 4,
      label: "Order Service",
      x: 480,
      y: 330,
      type: "process",
      icon: "ShoppingCart",
    },
    {
      id: 5,
      label: "Payment",
      x: 480,
      y: 520,
      type: "process",
      icon: "CreditCard",
    },
    // Load Balancers
    {
      id: 6,
      label: "User LB",
      x: 640,
      y: 140,
      type: "process",
      icon: "Network",
    },
    {
      id: 7,
      label: "Order LB",
      x: 640,
      y: 330,
      type: "process",
      icon: "Network",
    },
    {
      id: 8,
      label: "Pay LB",
      x: 640,
      y: 520,
      type: "process",
      icon: "Network",
    },
    // User Service Servers
    { id: 9, label: "User S1", x: 800, y: 80, type: "process", icon: "Server" },
    {
      id: 10,
      label: "User S2",
      x: 800,
      y: 140,
      type: "process",
      icon: "Server",
    },
    {
      id: 11,
      label: "User S3",
      x: 800,
      y: 200,
      type: "process",
      icon: "Server",
    },
    // Order Service Servers
    {
      id: 12,
      label: "Order S1",
      x: 800,
      y: 270,
      type: "process",
      icon: "Server",
    },
    {
      id: 13,
      label: "Order S2",
      x: 800,
      y: 330,
      type: "process",
      icon: "Server",
    },
    {
      id: 14,
      label: "Order S3",
      x: 800,
      y: 390,
      type: "process",
      icon: "Server",
    },
    // Payment Service Servers
    {
      id: 15,
      label: "Pay S1",
      x: 800,
      y: 460,
      type: "process",
      icon: "Server",
    },
    {
      id: 16,
      label: "Pay S2",
      x: 800,
      y: 520,
      type: "process",
      icon: "Server",
    },
    {
      id: 17,
      label: "Pay S3",
      x: 800,
      y: 580,
      type: "process",
      icon: "Server",
    },
    // Databases
    {
      id: 18,
      label: "User DB",
      x: 960,
      y: 140,
      type: "process",
      icon: "Database",
    },
    {
      id: 19,
      label: "Order DB",
      x: 960,
      y: 330,
      type: "process",
      icon: "Database",
    },
    {
      id: 20,
      label: "Pay DB",
      x: 960,
      y: 520,
      type: "process",
      icon: "Database",
    },
  ];

  // Add default configurations
  return baseNodes.map((node) => {
    let nodeTypeId = findNodeTypeByLabel(node.label);

    if (!nodeTypeId) {
      if (node.label.includes("Client")) nodeTypeId = "client-app";
      else if (node.label.includes("Gateway")) nodeTypeId = "api-gateway";
      else if (node.label.includes("LB")) nodeTypeId = "load-balancer";
      else if (node.label.includes("Service"))
        nodeTypeId = "application-server";
      else if (
        node.label.includes("Server") ||
        node.label.includes("S1") ||
        node.label.includes("S2") ||
        node.label.includes("S3")
      )
        nodeTypeId = "application-server";
      else if (node.label.includes("DB")) nodeTypeId = "database";
      else nodeTypeId = "application-server";
    }

    const defaultConfigurations = getDefaultConfigurationValues(nodeTypeId);

    return {
      ...node,
      configurations: defaultConfigurations,
    };
  });
};

const getInitialEdges = () => [
  // Client to API Gateway
  { id: "e1", source: 1, target: 2 },
  // API Gateway to Services
  { id: "e2", source: 2, target: 3 },
  { id: "e3", source: 2, target: 4 },
  { id: "e4", source: 2, target: 5 },
  // Services to Load Balancers
  { id: "e5", source: 3, target: 6 },
  { id: "e6", source: 4, target: 7 },
  { id: "e7", source: 5, target: 8 },
  // Load Balancers to Servers
  { id: "e8", source: 6, target: 9 },
  { id: "e9", source: 6, target: 10 },
  { id: "e10", source: 6, target: 11 },
  { id: "e11", source: 7, target: 12 },
  { id: "e12", source: 7, target: 13 },
  { id: "e13", source: 7, target: 14 },
  { id: "e14", source: 8, target: 15 },
  { id: "e15", source: 8, target: 16 },
  { id: "e16", source: 8, target: 17 },
  // Servers to Databases
  { id: "e17", source: 9, target: 18 },
  { id: "e18", source: 10, target: 18 },
  { id: "e19", source: 11, target: 18 },
  { id: "e20", source: 12, target: 19 },
  { id: "e21", source: 13, target: 19 },
  { id: "e22", source: 14, target: 19 },
  { id: "e23", source: 15, target: 20 },
  { id: "e24", source: 16, target: 20 },
  { id: "e25", source: 17, target: 20 },
];

// Helper function
const findNodeTypeByLabel = (label: string): string | null => {
  const nodeType = nodeTypeOptions.find(
    (type) =>
      type.label.toLowerCase().includes(label.toLowerCase()) ||
      label.toLowerCase().includes(type.label.toLowerCase())
  );
  return nodeType?.id || null;
};

// Initial state
const initialState: WorkflowState = {
  nodes: getInitialNodes(),
  edges: getInitialEdges(),
  selectedNode: null,
  draggingNode: null,
  dragOffset: { x: 0, y: 0 },
  connecting: null,
  tempLine: null,
  requestsPerSecond: 1,
  runCode: false,
};

// Create the Zustand store with Immer and localStorage persistence
export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    immer((set) => ({
      // Initial state
      ...initialState,

      // Node actions
      addNode: (nodeType) => {
        set((state) => {
          const newId = generateNodeId(state.nodes);
          const position = generateRandomPosition();

          const validTypes: NodeType[] = ["start", "process", "end"];
          const nodePositionType =
            nodeType?.type && validTypes.includes(nodeType.type as NodeType)
              ? (nodeType.type as NodeType)
              : "process";

          const newNode: Node = {
            id: newId,
            label: nodeType?.label || `Node ${newId}`,
            x: position.x,
            y: position.y,
            type: nodePositionType,
            icon: nodeType?.icon || "Circle",
            configurations: nodeType?.configurations || {},
          };

          state.nodes.push(newNode);
        });
      },

      deleteNode: (id) => {
        set((state) => {
          state.nodes = state.nodes.filter((n) => n.id !== id);
          state.edges = filterEdgesForNode(state.edges, id);
          if (state.selectedNode === id) {
            state.selectedNode = null;
          }
        });
      },

      updateNode: (nodeId, updates) => {
        set((state) => {
          const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
          if (nodeIndex !== -1) {
            Object.assign(state.nodes[nodeIndex], updates);
          }
        });
      },

      updateNodePosition: (nodeId, x, y) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            node.x = x;
            node.y = y;
          }
        });
      },

      // Edge actions
      addEdge: (source, target) => {
        set((state) => {
          if (!edgeExists(state.edges, source, target)) {
            state.edges.push({
              id: generateEdgeId(),
              source,
              target,
            });
          }
        });
      },

      deleteEdge: (edgeId) => {
        set((state) => {
          state.edges = state.edges.filter((e) => e.id !== edgeId);
        });
      },

      // UI state setters
      setSelectedNode: (id) => {
        set((state) => {
          state.selectedNode = id;
        });
      },

      setDraggingNode: (id) => {
        set((state) => {
          state.draggingNode = id;
        });
      },

      setDragOffset: (offset) => {
        set((state) => {
          state.dragOffset = offset;
        });
      },

      setConnecting: (id) => {
        set((state) => {
          state.connecting = id;
        });
      },

      setTempLine: (line) => {
        set((state) => {
          state.tempLine = line;
        });
      },

      // Simulation setters
      setRequestsPerSecond: (value) => {
        set((state) => {
          state.requestsPerSecond = value;
        });
      },

      setRunCode: (value) => {
        set((state) => {
          state.runCode = value;
        });
      },

      // Bulk operations
      setNodes: (nodes) => {
        set((state) => {
          state.nodes = nodes;
        });
      },

      setEdges: (edges) => {
        set((state) => {
          state.edges = edges;
        });
      },

      // Utility actions
      reset: () => {
        set(() => ({ ...initialState }));
      },

      clearSelection: () => {
        set((state) => {
          state.selectedNode = null;
          state.draggingNode = null;
          state.connecting = null;
          state.tempLine = null;
        });
      },
    })),
    {
      name: "workflow-editor-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not UI state
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        requestsPerSecond: state.requestsPerSecond,
      }),
      // Reset UI state on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.selectedNode = null;
          state.draggingNode = null;
          state.dragOffset = { x: 0, y: 0 };
          state.connecting = null;
          state.tempLine = null;
          state.runCode = false;
        }
      },
    }
  )
);
