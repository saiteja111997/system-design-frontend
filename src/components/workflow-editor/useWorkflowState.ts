import { useState } from "react";
import {
  Node,
  NodeType,
  Edge,
  TempLine,
  DragOffset,
} from "@/types/workflow-editor/workflow";
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

// Helper function to find node type ID by label
const findNodeTypeByLabel = (label: string): string | null => {
  const nodeType = nodeTypeOptions.find(
    (type) =>
      type.label.toLowerCase().includes(label.toLowerCase()) ||
      label.toLowerCase().includes(type.label.toLowerCase())
  );
  return nodeType?.id || null;
};

// Helper function to add default configurations to existing nodes
const addDefaultConfigurations = (nodes: Node[]): Node[] => {
  return nodes.map((node) => {
    if (node.configurations) {
      return node; // Already has configurations
    }

    // Try to find matching node type by label
    let nodeTypeId = findNodeTypeByLabel(node.label);

    // Fallback mapping for specific cases
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
      else nodeTypeId = "application-server"; // Default fallback
    }

    const defaultConfigurations = getDefaultConfigurationValues(nodeTypeId);

    return {
      ...node,
      configurations: defaultConfigurations,
    };
  });
};

const baseInitialNodes: Node[] = [
  // Client
  { id: 1, label: "Client", x: 160, y: 330, type: "start", icon: "Smartphone" },

  // API Gateway
  { id: 2, label: "Gateway", x: 320, y: 330, type: "process", icon: "Router" },

  // Services Layer - spread vertically to use more canvas space
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

  // Load Balancers - more horizontal spacing, aligned with services
  { id: 6, label: "User LB", x: 640, y: 140, type: "process", icon: "Network" },
  {
    id: 7,
    label: "Order LB",
    x: 640,
    y: 330,
    type: "process",
    icon: "Network",
  },
  { id: 8, label: "Pay LB", x: 640, y: 520, type: "process", icon: "Network" },

  // User Service Servers - properly aligned with User Service
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

  // Order Service Servers - properly aligned with Order Service
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

  // Payment Service Servers - properly aligned with Payment Service
  { id: 15, label: "Pay S1", x: 800, y: 460, type: "process", icon: "Server" },
  { id: 16, label: "Pay S2", x: 800, y: 520, type: "process", icon: "Server" },
  { id: 17, label: "Pay S3", x: 800, y: 580, type: "process", icon: "Server" },

  // Databases - use more horizontal space, aligned with services
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

// Add default configurations to all initial nodes
const initialNodes: Node[] = addDefaultConfigurations(baseInitialNodes);
const initialEdges: Edge[] = [
  // Client to API Gateway
  { id: "e1", source: 1, target: 2 },

  // API Gateway to Services
  { id: "e2", source: 2, target: 3 }, // to User Service
  { id: "e3", source: 2, target: 4 }, // to Order Service
  { id: "e4", source: 2, target: 5 }, // to Payment Service

  // Services to Load Balancers
  { id: "e5", source: 3, target: 6 }, // User Service to User LB
  { id: "e6", source: 4, target: 7 }, // Order Service to Order LB
  { id: "e7", source: 5, target: 8 }, // Payment Service to Payment LB

  // Load Balancers to Servers
  // User Load Balancer to User Servers
  { id: "e8", source: 6, target: 9 },
  { id: "e9", source: 6, target: 10 },
  { id: "e10", source: 6, target: 11 },

  // Order Load Balancer to Order Servers
  { id: "e11", source: 7, target: 12 },
  { id: "e12", source: 7, target: 13 },
  { id: "e13", source: 7, target: 14 },

  // Payment Load Balancer to Payment Servers
  { id: "e14", source: 8, target: 15 },
  { id: "e15", source: 8, target: 16 },
  { id: "e16", source: 8, target: 17 },

  // Servers to Databases
  // User Servers to User DB
  { id: "e17", source: 9, target: 18 },
  { id: "e18", source: 10, target: 18 },
  { id: "e19", source: 11, target: 18 },

  // Order Servers to Order DB
  { id: "e20", source: 12, target: 19 },
  { id: "e21", source: 13, target: 19 },
  { id: "e22", source: 14, target: 19 },

  // Payment Servers to Payment DB
  { id: "e23", source: 15, target: 20 },
  { id: "e24", source: 16, target: 20 },
  { id: "e25", source: 17, target: 20 },
];

export const useWorkflowState = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<number | null>(null);
  const [tempLine, setTempLine] = useState<TempLine | null>(null);
  const [requestsPerSecond, setRequestsPerSecond] = useState<number>(1);
  const [runCode, setRunCode] = useState<boolean>(false);

  const addNode = (nodeType?: {
    label: string;
    icon: string;
    type?: string;
    configurations?: Record<string, string | number | boolean>;
  }) => {
    const newId = generateNodeId(nodes);
    const position = generateRandomPosition();

    // Validate the type parameter
    const validTypes: NodeType[] = ["start", "process", "end"];
    const nodePositionType =
      nodeType?.type && validTypes.includes(nodeType.type as NodeType)
        ? (nodeType.type as NodeType)
        : "process";

    setNodes([
      ...nodes,
      {
        id: newId,
        label: nodeType?.label || `Node ${newId}`,
        x: position.x,
        y: position.y,
        type: nodePositionType,
        icon: nodeType?.icon || "Circle",
        configurations: nodeType?.configurations || {},
      } as Node,
    ]);
  };

  const deleteNode = (id: number) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(filterEdgesForNode(edges, id));
    setSelectedNode(null);
  };

  const deleteEdge = (edgeId: string) => {
    setEdges(edges.filter((e) => e.id !== edgeId));
  };

  const addEdge = (source: number, target: number) => {
    if (!edgeExists(edges, source, target)) {
      setEdges([
        ...edges,
        {
          id: generateEdgeId(),
          source,
          target,
        },
      ]);
    }
  };

  const updateNodePosition = (nodeId: number, x: number, y: number) => {
    setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)));
  };

  const updateNode = (nodeId: number, updates: Partial<Node>) => {
    setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
  };

  return {
    // State
    nodes,
    edges,
    selectedNode,
    draggingNode,
    dragOffset,
    connecting,
    tempLine,
    requestsPerSecond,
    runCode,

    // Setters
    setNodes,
    setEdges,
    setSelectedNode,
    setDraggingNode,
    setDragOffset,
    setConnecting,
    setTempLine,
    setRequestsPerSecond,
    setRunCode,

    // Actions
    addNode,
    deleteNode,
    deleteEdge,
    addEdge,
    updateNodePosition,
    updateNode,
  };
};
