/**
 * Compatibility hook that maintains the same API as the original useWorkflowState
 * This allows us to migrate to Zustand without breaking existing components
 */

import { useWorkflowStore } from "@/stores/workflowStore";

export const useWorkflowState = () => {
  // Get all state and actions from Zustand store
  const store = useWorkflowStore();

  return {
    // State (same structure as before)
    nodes: store.nodes,
    edges: store.edges,
    selectedNode: store.selectedNode,
    draggingNode: store.draggingNode,
    dragOffset: store.dragOffset,
    connecting: store.connecting,
    tempLine: store.tempLine,
    requestsPerSecond: store.requestsPerSecond,
    runCode: store.runCode,

    // Setters (same API as before)
    setNodes: store.setNodes,
    setEdges: store.setEdges,
    setSelectedNode: store.setSelectedNode,
    setDraggingNode: store.setDraggingNode,
    setDragOffset: store.setDragOffset,
    setConnecting: store.setConnecting,
    setTempLine: store.setTempLine,
    setRequestsPerSecond: store.setRequestsPerSecond,
    setRunCode: store.setRunCode,

    // Actions (same API as before)
    addNode: store.addNode,
    deleteNode: store.deleteNode,
    deleteEdge: store.deleteEdge,
    addEdge: store.addEdge,
    updateNodePosition: store.updateNodePosition,
    updateNode: store.updateNode,
  };
};
