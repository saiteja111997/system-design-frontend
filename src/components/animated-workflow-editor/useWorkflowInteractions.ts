import { useCallback } from "react";
import { Node, TempLine, DragOffset } from "@/types/workflow";

interface UseWorkflowInteractionsProps {
  nodes: Node[];
  draggingNode: number | null;
  connecting: number | null;
  dragOffset: DragOffset;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  setSelectedNode: (id: number | null) => void;
  setDraggingNode: (id: number | null) => void;
  setDragOffset: (offset: DragOffset) => void;
  setConnecting: (id: number | null) => void;
  setTempLine: (line: TempLine | null) => void;
  updateNodePosition: (nodeId: number, x: number, y: number) => void;
  addEdge: (source: number, target: number) => void;
  deleteNode: (id: number) => void;
}

export const useWorkflowInteractions = ({
  nodes,
  draggingNode,
  connecting,
  dragOffset,
  canvasRef,
  setSelectedNode,
  setDraggingNode,
  setDragOffset,
  setConnecting,
  setTempLine,
  updateNodePosition,
  addEdge,
  deleteNode,
}: UseWorkflowInteractionsProps) => {
  // Helper function to convert viewport coordinates to canvas coordinates
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: clientX, y: clientY };

      const rect = canvasRef.current.getBoundingClientRect();

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [canvasRef]
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      if (e.button === 0) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
        setDraggingNode(nodeId);
        setSelectedNode(nodeId);
        setDragOffset({
          x: canvasCoords.x - node.x,
          y: canvasCoords.y - node.y,
        });
      }
    },
    [
      nodes,
      setDraggingNode,
      setSelectedNode,
      setDragOffset,
      getCanvasCoordinates,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);

      if (draggingNode !== null) {
        const newX = canvasCoords.x - dragOffset.x;
        const newY = canvasCoords.y - dragOffset.y;
        updateNodePosition(draggingNode, newX, newY);
      }

      // Update temporary connection line while connecting
      if (connecting !== null) {
        const sourceNode = nodes.find((n) => n.id === connecting);
        if (sourceNode) {
          setTempLine({
            x1: sourceNode.x,
            y1: sourceNode.y,
            x2: canvasCoords.x,
            y2: canvasCoords.y,
          });
        }
      }
    },
    [
      draggingNode,
      connecting,
      nodes,
      dragOffset,
      updateNodePosition,
      setTempLine,
      getCanvasCoordinates,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    if (connecting !== null) {
      setConnecting(null);
      setTempLine(null);
    }
  }, [setDraggingNode, connecting, setConnecting, setTempLine]);

  const handleNodeClick = useCallback(
    (nodeId: number) => {
      setSelectedNode(nodeId);
    },
    [setSelectedNode]
  );

  const handleStartConnection = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      e.stopPropagation();
      setConnecting(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setTempLine({
          x1: node.x,
          y1: node.y,
          x2: node.x,
          y2: node.y,
        });
      }
    },
    [nodes, setConnecting, setTempLine]
  );

  const handleEndConnection = useCallback(
    (e: React.MouseEvent, targetId: number) => {
      e.stopPropagation();
      if (connecting !== null && connecting !== targetId) {
        addEdge(connecting, targetId);
      }
      setConnecting(null);
      setTempLine(null);
    },
    [connecting, addEdge, setConnecting, setTempLine]
  );

  const handleDeleteNode = useCallback(
    (nodeId: number) => {
      deleteNode(nodeId);
    },
    [deleteNode]
  );

  return {
    handleNodeMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleNodeClick,
    handleStartConnection,
    handleEndConnection,
    handleDeleteNode,
  };
};
