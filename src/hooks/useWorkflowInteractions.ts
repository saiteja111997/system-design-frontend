/**
 * Optimized workflow interactions hook using Zustand selectors
 * This provides better performance by subscribing only to relevant state changes
 */

import { useCallback } from "react";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { UseWorkflowInteractionsProps } from "@/types/workflow-editor/components";

export const useWorkflowInteractions = ({
  canvasRef,
}: Pick<UseWorkflowInteractionsProps, "canvasRef">) => {
  // Use direct Zustand selectors
  const nodes = useWorkflowStore((state) => state.nodes);
  const draggingNode = useWorkflowStore((state) => state.draggingNode);
  const dragOffset = useWorkflowStore((state) => state.dragOffset);
  const connecting = useWorkflowStore((state) => state.connecting);

  // Use direct action selectors
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const setDraggingNode = useWorkflowStore((state) => state.setDraggingNode);
  const setDragOffset = useWorkflowStore((state) => state.setDragOffset);
  const setConnecting = useWorkflowStore((state) => state.setConnecting);
  const setTempLine = useWorkflowStore((state) => state.setTempLine);
  const updateNodePosition = useWorkflowStore(
    (state) => state.updateNodePosition
  );
  const addEdge = useWorkflowStore((state) => state.addEdge);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  // Helper function to convert viewport coordinates to canvas coordinates
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: clientX, y: clientY };

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      return { x: rawX, y: rawY };
    },
    [canvasRef]
  );

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      if (e.button === 0) {
        e.stopPropagation();
        e.preventDefault();

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
      if (currentSelectedNode === nodeId) {
        setSelectedNode(null);
      } else {
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
