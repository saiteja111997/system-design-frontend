/**
 * Optimized hook for node-specific interactions (drag, select, connect, delete)
 * Separated from canvas coordinate logic for better maintainability
 */

import { useCallback } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";

interface UseNodeInteractionsProps {
  getCanvasCoordinates: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number };
}

export const useNodeInteractions = ({
  getCanvasCoordinates,
}: UseNodeInteractionsProps) => {
  // Zustand selectors - subscribe only to what we need
  const nodes = useWorkflowStore((state) => state.nodes);
  const draggingNode = useWorkflowStore((state) => state.draggingNode);
  const dragOffset = useWorkflowStore((state) => state.dragOffset);
  const connecting = useWorkflowStore((state) => state.connecting);

  // Actions
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

  // Node selection with toggle behavior
  const handleNodeSelect = useCallback(
    (nodeId: number, currentSelectedNode: number | null) => {
      setSelectedNode(currentSelectedNode === nodeId ? null : nodeId);
    },
    [setSelectedNode]
  );

  // Start dragging a node
  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      if (e.button !== 0) return; // Only left click

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
    },
    [nodes, setDraggingNode, setDragOffset, getCanvasCoordinates]
  );

  // Update node position during drag
  const handleNodeDrag = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNode === null) return;

      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      const newX = canvasCoords.x - dragOffset.x;
      const newY = canvasCoords.y - dragOffset.y;

      updateNodePosition(draggingNode, newX, newY);
    },
    [draggingNode, dragOffset, updateNodePosition, getCanvasCoordinates]
  );

  // End node dragging
  const handleNodeDragEnd = useCallback(() => {
    setDraggingNode(null);
  }, [setDraggingNode]);

  // Start connection from node
  const handleConnectionStart = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      e.stopPropagation();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setConnecting(nodeId);
      setTempLine({
        x1: node.x,
        y1: node.y,
        x2: node.x,
        y2: node.y,
      });
    },
    [nodes, setConnecting, setTempLine]
  );

  // Update connection line during drag
  const handleConnectionDrag = useCallback(
    (e: React.MouseEvent) => {
      if (connecting === null) return;

      const sourceNode = nodes.find((n) => n.id === connecting);
      if (!sourceNode) return;

      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      setTempLine({
        x1: sourceNode.x,
        y1: sourceNode.y,
        x2: canvasCoords.x,
        y2: canvasCoords.y,
      });
    },
    [connecting, nodes, setTempLine, getCanvasCoordinates]
  );

  // End connection on target node
  const handleConnectionEnd = useCallback(
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

  // Cancel connection
  const handleConnectionCancel = useCallback(() => {
    setConnecting(null);
    setTempLine(null);
  }, [setConnecting, setTempLine]);

  // Delete node with confirmation
  const handleNodeDelete = useCallback(
    (nodeId: number) => {
      deleteNode(nodeId);
    },
    [deleteNode]
  );

  return {
    // State
    draggingNode,
    connecting,

    // Node actions
    handleNodeSelect,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragEnd,
    handleNodeDelete,

    // Connection actions
    handleConnectionStart,
    handleConnectionDrag,
    handleConnectionEnd,
    handleConnectionCancel,
  };
};
