import { useState } from "react";
import { Node, Edge, TempLine, DragOffset } from "@/types/workflow";
import {
  generateNodeId,
  generateEdgeId,
  generateRandomPosition,
  edgeExists,
  filterEdgesForNode,
} from "@/utils/workflow";

const initialNodes: Node[] = [
  // Client
  { id: 1, label: "Client", x: 100, y: 400, type: "start" },

  // API Gateway
  { id: 2, label: "API Gateway", x: 350, y: 400, type: "process" },

  // Services Layer - Much more spread vertically
  { id: 3, label: "User Service", x: 600, y: 200, type: "process" },
  { id: 4, label: "Order Service", x: 600, y: 400, type: "process" },
  { id: 5, label: "Payment Service", x: 600, y: 600, type: "process" },

  // Load Balancers - Aligned with services
  { id: 6, label: "User LB", x: 850, y: 200, type: "process" },
  { id: 7, label: "Order LB", x: 850, y: 400, type: "process" },
  { id: 8, label: "Payment LB", x: 850, y: 600, type: "process" },

  // User Service Servers - More vertical spread
  { id: 9, label: "User Server 1", x: 1100, y: 120, type: "process" },
  { id: 10, label: "User Server 2", x: 1100, y: 200, type: "process" },
  { id: 11, label: "User Server 3", x: 1100, y: 280, type: "process" },

  // Order Service Servers - Clear separation from user servers
  { id: 12, label: "Order Server 1", x: 1100, y: 320, type: "process" },
  { id: 13, label: "Order Server 2", x: 1100, y: 400, type: "process" },
  { id: 14, label: "Order Server 3", x: 1100, y: 480, type: "process" },

  // Payment Service Servers - Clear separation from order servers
  { id: 15, label: "Payment Server 1", x: 1100, y: 520, type: "process" },
  { id: 16, label: "Payment Server 2", x: 1100, y: 600, type: "process" },
  { id: 17, label: "Payment Server 3", x: 1100, y: 680, type: "process" },

  // Databases - Aligned with their respective services
  { id: 18, label: "User DB", x: 1350, y: 200, type: "process" },
  { id: 19, label: "Order DB", x: 1350, y: 400, type: "process" },
  { id: 20, label: "Payment DB", x: 1350, y: 600, type: "process" },
];
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
  const [requestsPerSecond, setRequestsPerSecond] = useState<number>(1500);

  const addNode = () => {
    const newId = generateNodeId(nodes);
    const position = generateRandomPosition();

    setNodes([
      ...nodes,
      {
        id: newId,
        label: `Node ${newId}`,
        x: position.x,
        y: position.y,
        type: "process",
      },
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

    // Setters
    setNodes,
    setEdges,
    setSelectedNode,
    setDraggingNode,
    setDragOffset,
    setConnecting,
    setTempLine,
    setRequestsPerSecond,

    // Actions
    addNode,
    deleteNode,
    deleteEdge,
    addEdge,
    updateNodePosition,
  };
};
