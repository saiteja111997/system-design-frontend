import React, { useRef, useState, useEffect, useCallback } from "react";
import type { CanvasState } from "../../../utils/annotationUtils";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NodeHandlers, EdgeHandlers } from "@/types/workflow-studio/workflow";
import { WorkflowHeader, WorkflowCanvas, WorkflowFooter } from ".";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useWorkflowCanvas } from "@/hooks/useWorkflowCanvas";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { CanvasControlsProvider } from "@/contexts/CanvasControlsContext";
import {
  FullscreenProvider,
  useFullscreenContext,
} from "@/contexts/FullscreenContext";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { canvasDockItems } from "@/data/canvasDockItems";
import {
  createDockItemHandlers,
  handleDockItemClick,
} from "@/utils/dockHandlers";
import SidebarRight from "./sidebar-right/SidebarRight";
import DockNavigation from "./DockNavigation";
import RunButton from "./RunButton";
import ZoomIndicator from "./ZoomIndicator";
import { type Tool } from "./AnnotationLayer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "@/styles/workflowAnimations.css";

// Auto-save interval for annotation state (configurable)
const AUTO_SAVE_INTERVAL_MS = 2500;

const WorkflowEditorContent: React.FC = () => {
  // Annotation persistence across fullscreen
  const annotationLayerRef = useRef<
    import("./AnnotationLayer").AnnotationLayerHandle | null
  >(null);

  // Use refs to store annotation state to avoid unnecessary effect re-runs
  const annotationSnapshotRef = useRef<CanvasState | null>(null);
  const annotationHistoryRef = useRef<{
    history: CanvasState[];
    currentIndex: number;
  } | null>(null);

  // Guard to prevent concurrent auto-save operations
  const annotationSavingRef = useRef<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Simple annotation state - back to clean approach!
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isAnnotationLayerVisible, setIsAnnotationLayerVisible] =
    useState(false);

  // Clear confirmation dialog state
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { isFullscreen, exitFullscreen, toggleFullscreen } =
    useFullscreenContext();

  /**
   * Handle annotation persistence across fullscreen transitions
   * Only depends on isFullscreen to avoid unnecessary re-runs
   * Reads latest state from refs instead of state dependencies
   */
  useEffect(() => {
    const currentRef = annotationLayerRef.current;
    if (!currentRef) return;

    // Small delay to ensure canvas is ready after mode change
    const timer = setTimeout(() => {
      if (annotationLayerRef.current) {
        // Read latest values from refs (updated by auto-save)
        const latestHistory = annotationHistoryRef.current;
        const latestSnapshot = annotationSnapshotRef.current;

        // Restore history if available
        if (latestHistory) {
          try {
            annotationLayerRef.current.importHistory(latestHistory);
            const canvas = annotationLayerRef.current?.getCanvas();
            canvas?.renderAll();
          } catch (error) {
            console.error("[WorkflowEditor] Failed to restore history:", error);
            // Fallback to snapshot
            if (latestSnapshot) {
              annotationLayerRef.current
                .load(latestSnapshot)
                .then(() => {
                  const canvas = annotationLayerRef.current?.getCanvas();
                  canvas?.renderAll();
                })
                .catch((err) =>
                  console.error(
                    "[WorkflowEditor] Fallback restore failed:",
                    err
                  )
                );
            }
          }
        } else if (latestSnapshot) {
          // No history, use snapshot
          annotationLayerRef.current
            .load(latestSnapshot)
            .then(() => {
              const canvas = annotationLayerRef.current?.getCanvas();
              canvas?.renderAll();
            })
            .catch((error) =>
              console.error("[WorkflowEditor] Snapshot restore failed:", error)
            );
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isFullscreen]); // Only depend on isFullscreen, not snapshot/history

  /**
   * Continuously sync annotation state to refs
   * This ensures state is always current regardless of how fullscreen is toggled
   */
  useEffect(() => {
    if (!annotationLayerRef.current) return;

    // Auto-save state periodically and on changes
    const saveCurrentState = () => {
      // Skip if a save operation is already in progress to avoid race conditions
      if (annotationSavingRef.current || !annotationLayerRef.current) return;

      // Set guard to prevent concurrent saves
      annotationSavingRef.current = true;

      try {
        const snapshot = annotationLayerRef.current.snapshot();
        const history = annotationLayerRef.current.exportHistory();

        // Update refs for restoration effect to read
        if (snapshot) {
          annotationSnapshotRef.current = snapshot;
          // Don't update state to avoid causing re-renders
        }
        if (history) {
          annotationHistoryRef.current = history;
          // Don't update state to avoid causing re-renders
        }
      } catch (error) {
        console.error(
          "[WorkflowEditor] Failed to auto-save annotation state:",
          error
        );
      } finally {
        // Always release the guard, even if an error occurred
        annotationSavingRef.current = false;
      }
    };

    // Save on a regular interval to catch all changes (configurable interval)
    const interval = setInterval(saveCurrentState, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  /**
   * Save annotation state before ANY fullscreen transition
   */
  const saveAnnotationState = useCallback(() => {
    // Skip if a save operation is already in progress or no ref available
    if (annotationSavingRef.current || !annotationLayerRef.current) return;

    // Set guard to prevent concurrent saves
    annotationSavingRef.current = true;

    try {
      const snapshot = annotationLayerRef.current.snapshot();
      const history = annotationLayerRef.current.exportHistory();

      // Update refs for restoration effect to read
      if (snapshot) {
        annotationSnapshotRef.current = snapshot;
        // Don't update state to avoid causing re-renders
      }
      if (history) {
        annotationHistoryRef.current = history;
        // Don't update state to avoid causing re-renders
      }
    } catch (error) {
      console.error("[WorkflowEditor] Failed to save annotations:", error);
    } finally {
      // Always release the guard, even if an error occurred
      annotationSavingRef.current = false;
    }
  }, []);

  /**
   * Handle fullscreen toggle - save first, then toggle
   */
  const handleFullscreenToggle = useCallback(() => {
    saveAnnotationState();
    toggleFullscreen();
  }, [saveAnnotationState, toggleFullscreen]);

  /**
   * Handle fullscreen exit - save first, then exit
   */
  const handleExitFullscreen = useCallback(() => {
    saveAnnotationState();
    exitFullscreen();
  }, [saveAnnotationState, exitFullscreen]);

  // Handle confirmed clear action
  const handleConfirmedClear = useCallback(() => {
    annotationLayerRef.current?.clear();
    // Save state after clear
    saveAnnotationState();
    setShowClearDialog(false);
  }, [saveAnnotationState]);

  // Canvas controls - clean and simple!
  const canvasControls = useCanvasControlsContext();
  const { MIN_ZOOM, MAX_ZOOM } = canvasControls;
  const dockHandlers = createDockItemHandlers(
    canvasControls,
    { toggleFullscreen: handleFullscreenToggle },
    {
      setActiveTool: (tool: Tool) => {
        setActiveTool(tool);
        // Show annotation layer when a drawing tool is selected
        if (tool !== "select") {
          setIsAnnotationLayerVisible(true);
        }
      },
      undo: () => {
        annotationLayerRef.current?.undo();
        // Save state after undo
        saveAnnotationState();
      },
      redo: () => {
        annotationLayerRef.current?.redo();
        // Save state after redo
        saveAnnotationState();
      },
      clearAll: () => {
        // Show confirmation dialog instead of clearing immediately
        setShowClearDialog(true);
      },
    }
  );

  const handleWorkflowDockItemClick = (itemId: string) => {
    handleDockItemClick(itemId, dockHandlers);
  };

  // State management using direct Zustand selectors
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
  const draggingNode = useWorkflowStore((state) => state.draggingNode);
  const tempLine = useWorkflowStore((state) => state.tempLine);
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );
  const runCode = useWorkflowStore((state) => state.runCode);

  // Actions using direct Zustand selectors
  const addNode = useWorkflowStore((state) => state.addNode);
  const clearSelection = useWorkflowStore((state) => state.clearSelection);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setRequestsPerSecond = useWorkflowStore(
    (state) => state.setRequestsPerSecond
  );
  const setRunCode = useWorkflowStore((state) => state.setRunCode);

  // Optimized interaction handlers using the new hook architecture
  const workflowCanvas = useWorkflowCanvas({ canvasRef });
  const {
    handleNodeSelect,
    handleNodeDragStart,
    handleConnectionStart,
    handleConnectionEnd,
    handleNodeDelete,
  } = workflowCanvas.nodeInteractions;

  const { handleEdgeSelect, handleEdgeDelete } =
    workflowCanvas.edgeInteractions;

  // Handler objects for cleaner prop passing
  const nodeHandlers: NodeHandlers = {
    onMouseDown: handleNodeDragStart,
    onSelect: (nodeId: number) => handleNodeSelect(nodeId),
    onStartConnection: handleConnectionStart,
    onEndConnection: handleConnectionEnd,
    onDelete: (nodeId: number) => handleNodeDelete(nodeId),
  };

  const edgeHandlers: EdgeHandlers = {
    onDelete: (edgeId: string) => handleEdgeDelete(edgeId),
    onSelect: (edgeId: string) => handleEdgeSelect(edgeId),
  };

  // Custom mouse up handler to clear selections when clicking on canvas background
  const handleCanvasMouseUp = () => {
    // Check if we're ending a drag operation before calling the handler
    const wasDragging = draggingNode !== null;

    // Call the original handler (this will clear draggingNode)
    workflowCanvas.handleMouseUp();

    // Only clear selection if we weren't dragging a node
    // This prevents clearing selection when finishing a node drag
    if (!wasDragging) {
      clearSelection();
    }
  };

  const workflowContent = (
    <WorkflowProvider
      requestsPerSecond={requestsPerSecond}
      setRequestsPerSecond={setRequestsPerSecond}
    >
      <div className="relative flex h-full">
        {/* Main content area - with right margin for sidebar */}
        <div className="flex-1 flex flex-col mr-[74px]">
          {/* Only show header in normal mode, not in fullscreen */}
          {!isFullscreen && <WorkflowHeader onAddNode={addNode} />}

          <div
            className="flex-1 flex flex-col select-none bg-white dark:bg-slate-950 relative"
            onMouseLeave={workflowCanvas.handleMouseUp}
            ref={containerRef}
          >
            {/* Workflow Canvas */}
            <div className="flex-1 flex relative">
              <WorkflowCanvas
                ref={canvasRef}
                nodes={nodes}
                edges={edges}
                tempLine={tempLine}
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                draggingNode={draggingNode}
                nodeHandlers={nodeHandlers}
                edgeHandlers={edgeHandlers}
                onMouseMove={workflowCanvas.handleMouseMove}
                onMouseUp={handleCanvasMouseUp}
                runCode={runCode}
                activeTool={activeTool}
                isAnnotationLayerVisible={isAnnotationLayerVisible}
                annotationLayerRef={annotationLayerRef}
                onAnnotationToolChange={setActiveTool}
                onAnnotationSnapshotChange={(snapshot) => {
                  // Update ref for persistence but don't update state to avoid re-renders
                  if (snapshot) {
                    annotationSnapshotRef.current = snapshot;
                  }
                }}
              />

              {/* Dock Navigation - positioned in top-left of workflow editor */}
              <DockNavigation
                collapsible={false}
                position="top-left"
                responsive="top-left"
                items={canvasDockItems}
                onItemClick={handleWorkflowDockItemClick}
                activeItem={activeTool}
              />

              {/* Run Button - positioned below DockNavigation */}
              <div className="absolute bottom-4 right-4 z-20">
                <RunButton runCode={runCode} onToggle={setRunCode} />
              </div>

              {/* Zoom Indicator - positioned on the right side before sidebar */}
              <div className="absolute top-4 right-4 z-20">
                <ZoomIndicator
                  currentZoom={canvasControls.transform.scale}
                  minZoom={MIN_ZOOM}
                  maxZoom={MAX_ZOOM}
                  onZoomChange={canvasControls.setZoom}
                  onResetZoom={canvasControls.resetViewport}
                />
              </div>
            </div>

            {!isFullscreen && (
              <WorkflowFooter
                nodeCount={nodes.length}
                edgeCount={edges.length}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - now sibling to main content, extends full height */}
        <SidebarRight
          requestsPerSecond={requestsPerSecond}
          onRequestsPerSecondChange={setRequestsPerSecond}
          nodes={nodes}
          onAddNode={addNode}
          onUpdateNode={updateNode}
        />
      </div>
    </WorkflowProvider>
  );

  return (
    <>
      {/* Clear All Confirmation Dialog - Always render at top level with high z-index */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Drawings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your drawings on the canvas. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedClear}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Normal workflow content */}
      {!isFullscreen && workflowContent}

      {/* Fullscreen content using Portal */}
      {isFullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950">
            {/* Exit fullscreen button */}
            <button
              onClick={handleExitFullscreen}
              className="fixed top-6 left-24 z-[10000] w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Exit Fullscreen"
            >
              <X
                size={20}
                className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors"
              />
            </button>

            {/* Fullscreen workflow content */}
            {workflowContent}
          </div>,
          document.body
        )}
    </>
  );
};

const WorkflowStudio: React.FC = () => {
  return (
    <FullscreenProvider>
      <CanvasControlsProvider>
        <WorkflowEditorContent />
      </CanvasControlsProvider>
    </FullscreenProvider>
  );
};

export default WorkflowStudio;
