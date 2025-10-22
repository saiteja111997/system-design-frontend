/**
 * Optimized hook for edge-specific interactions (select, delete)
 * Following the same pattern as useNodeInteractions for consistency
 */

import { useCallback, useState } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";

export const useEdgeInteractions = () => {
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Zustand selectors - subscribe only to what we need
  const edges = useWorkflowStore((state) => state.edges);
  const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
  const sidebarRightExpanded = useWorkflowStore(
    (state) => state.sidebarRightExpanded
  );

  // Actions
  const setSelectedEdge = useWorkflowStore((state) => state.setSelectedEdge);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge);
  const setSidebarRightExpanded = useWorkflowStore(
    (state) => state.setSidebarRightExpanded
  );
  const setSelectedTab = useWorkflowStore((state) => state.setSelectedTab);

  // Edge selection with toggle behavior and logging
  const handleEdgeSelect = useCallback(
    (edgeId: string) => {
      // If edge is already selected, don't deselect it (keep it selected)
      // This prevents deselection when delete interactions occur
      if (selectedEdge === edgeId) {
        // console.log("🔗 Edge Already Selected - Keeping Selection:", edgeId);
        return;
      }

      // Only select if it's a different edge
      setSelectedNode(null); // Clear node selection when edge is selected
      setSelectedEdge(edgeId);

      // Expand sidebar and set analytics tab when selecting a new edge
      if (!sidebarRightExpanded) {
        setSidebarRightExpanded(true);
      }
      setSelectedTab("analytics");

      const edge = edges.find((e) => e.id === edgeId);
      console.log(
        "🔗 Edge Selected:",
        edgeId,
        `${edge?.source}->${edge?.target}`
      );
    },
    [
      selectedEdge,
      setSelectedEdge,
      setSelectedNode,
      edges,
      sidebarRightExpanded,
      setSidebarRightExpanded,
      setSelectedTab,
    ]
  );

  // Handle edge click - selection when not selected, delete modal when selected
  const handleEdgeClick = useCallback(
    (e: React.MouseEvent, edgeId: string) => {
      e.stopPropagation();

      if (selectedEdge === edgeId) {
        // If edge is already selected, show delete confirmation
        setShowDeleteModal(edgeId);
      } else {
        // If not selected, select it
        handleEdgeSelect(edgeId);
      }
    },
    [selectedEdge, handleEdgeSelect]
  );

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      console.log(
        "🗑️ Edge Deleted:",
        edgeId,
        `${edge?.source}->${edge?.target}`
      );

      deleteEdge(edgeId);
      setShowDeleteModal(null);
    },
    [deleteEdge, edges]
  );

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(null);
  }, []);

  // Delete edge directly (for context menu or keyboard shortcuts)
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      console.log(
        "🗑️ Edge Deleted (Direct):",
        edgeId,
        `${edge?.source}->${edge?.target}`
      );

      deleteEdge(edgeId);
    },
    [deleteEdge, edges]
  );

  return {
    // State
    selectedEdge,
    showDeleteModal,

    // Modal controls
    setShowDeleteModal,

    // Edge actions
    handleEdgeSelect,
    handleEdgeClick,
    handleEdgeDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
