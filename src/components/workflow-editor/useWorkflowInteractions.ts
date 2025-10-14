import { useCallback, useEffect } from "react";
import { UseWorkflowInteractionsProps } from "@/types/workflow-editor/components";

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

      // Get the raw canvas coordinates
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      return {
        x: rawX,
        y: rawY,
      };
    },
    [canvasRef]
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      if (e.button === 0) {
        e.stopPropagation(); // Prevent canvas panning when dragging nodes
        e.preventDefault(); // Prevent text selection

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
        setDraggingNode(nodeId);
        setDragOffset({
          x: canvasCoords.x - node.x,
          y: canvasCoords.y - node.y,
        });
      }
    },
    [nodes, setDraggingNode, setDragOffset, getCanvasCoordinates]
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
    (nodeId: number, currentSelectedNode: number | null) => {
      // Simple toggle: if clicking the same node that's already selected, deselect it
      if (currentSelectedNode === nodeId) {
        setSelectedNode(null);
      } else {
        // Otherwise, select the clicked node
        setSelectedNode(nodeId);
      }
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

  // Global mouse up listener to handle mouse release outside the canvas area
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Only call handleMouseUp if we're actually dragging something
      if (draggingNode !== null || connecting !== null) {
        handleMouseUp();
      }
    };

    // Add global event listener
    document.addEventListener("mouseup", handleGlobalMouseUp);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseUp, draggingNode, connecting]);

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
