import React, { useRef, useState, useEffect, useCallback } from "react";
import type { CanvasState } from "../../utils/annotationUtils";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NodeHandlers, EdgeHandlers } from "@/types/workflow-editor/workflow";
import { WorkflowHeader, WorkflowCanvas, WorkflowFooter } from ".";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { useWorkflowInteractions } from "@/hooks/useWorkflowInteractions";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { CanvasControlsProvider } from "@/contexts/CanvasControlsContext";
import {
  FullscreenProvider,
  useFullscreenContext,
} from "@/contexts/FullscreenContext";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { MIN_ZOOM, MAX_ZOOM } from "@/hooks/useCanvasControls";
import { canvasDockItems } from "@/data/canvasDockItems";
import {
  createDockItemHandlers,
  handleDockItemClick,
} from "@/utils/dockHandlers";
import SidebarRight from "./sidebar-right/SidebarRight";
import DockNavigation from "./DockNavigation";
import RunButton from "./RunButton";
import ZoomIndicator from "./ZoomIndicator";
import { AnnotationLayer, type Tool } from "./AnnotationLayer";
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

  // Keep state for initial load, but use refs for updates
  const [annotationSnapshot, setAnnotationSnapshot] =
    useState<CanvasState | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_annotationHistory, setAnnotationHistory] = useState<{
    history: CanvasState[];
    currentIndex: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
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
      if (annotationLayerRef.current) {
        try {
          const snapshot = annotationLayerRef.current.snapshot();
          const history = annotationLayerRef.current.exportHistory();

          // Update refs for restoration effect to read
          if (snapshot) {
            annotationSnapshotRef.current = snapshot;
            setAnnotationSnapshot(snapshot); // Keep state for initial load
          }
          if (history) {
            annotationHistoryRef.current = history;
            setAnnotationHistory(history); // Keep state for initial load
          }
        } catch (error) {
          console.error(
            "[WorkflowEditor] Failed to auto-save annotation state:",
            error
          );
        }
      }
    };

    // Save on a regular interval to catch all changes
    const interval = setInterval(saveCurrentState, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Save annotation state before ANY fullscreen transition
   */
  const saveAnnotationState = useCallback(() => {
    if (annotationLayerRef.current) {
      try {
        const snapshot = annotationLayerRef.current.snapshot();
        const history = annotationLayerRef.current.exportHistory();

        // Update refs for restoration effect to read
        if (snapshot) {
          annotationSnapshotRef.current = snapshot;
          setAnnotationSnapshot(snapshot);
        }
        if (history) {
          annotationHistoryRef.current = history;
          setAnnotationHistory(history);
        }
      } catch (error) {
        console.error("[WorkflowEditor] Failed to save annotations:", error);
      }
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

  // Annotation state
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isAnnotationLayerVisible, setIsAnnotationLayerVisible] =
    useState(false);

  // Clear confirmation dialog state
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Handle confirmed clear action
  const handleConfirmedClear = useCallback(() => {
    annotationLayerRef.current?.clear();
    // Save state after clear
    saveAnnotationState();
    setShowClearDialog(false);
  }, [saveAnnotationState]);

  // Canvas controls - now properly inside CanvasControlsProvider
  const canvasControls = useCanvasControlsContext();
  const dockHandlers = createDockItemHandlers(
    canvasControls,
    { toggleFullscreen: handleFullscreenToggle }, // Use our wrapped version that saves state
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
  const draggingNode = useWorkflowStore((state) => state.draggingNode);
  const tempLine = useWorkflowStore((state) => state.tempLine);
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );
  const runCode = useWorkflowStore((state) => state.runCode);

  // Actions using direct Zustand selectors
  const addNode = useWorkflowStore((state) => state.addNode);
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setRequestsPerSecond = useWorkflowStore(
    (state) => state.setRequestsPerSecond
  );
  const setRunCode = useWorkflowStore((state) => state.setRunCode);

  // Optimized interaction handlers
  const {
    handleNodeMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleNodeClick,
    handleStartConnection,
    handleEndConnection,
    handleDeleteNode,
  } = useWorkflowInteractions({
    canvasRef,
  });

  // Handler objects for cleaner prop passing
  const nodeHandlers: NodeHandlers = {
    onMouseDown: handleNodeMouseDown,
    onClick: (nodeId: number) => handleNodeClick(nodeId, selectedNode),
    onStartConnection: handleStartConnection,
    onEndConnection: handleEndConnection,
    onDelete: handleDeleteNode,
  };

  const edgeHandlers: EdgeHandlers = {
    onDelete: deleteEdge,
  };

  const workflowContent = (
    <WorkflowProvider
      requestsPerSecond={requestsPerSecond}
      setRequestsPerSecond={setRequestsPerSecond}
    >
      {/* Only show header in normal mode, not in fullscreen */}
      {!isFullscreen && <WorkflowHeader onAddNode={addNode} />}
      <div
        className="flex flex-col select-none bg-white dark:bg-slate-950 relative h-full"
        onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        {/* Main content area with right sidebar */}
        <div className="flex-1 flex relative">
          {/* Workflow Canvas - with right margin for collapsed sidebar */}
          <div className="flex-1 flex flex-col mr-[74px]">
            <WorkflowCanvas
              ref={canvasRef}
              nodes={nodes}
              edges={edges}
              tempLine={tempLine}
              selectedNode={selectedNode}
              draggingNode={draggingNode}
              nodeHandlers={nodeHandlers}
              edgeHandlers={edgeHandlers}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              runCode={runCode}
            />

            {/* Annotation Layer Overlay */}
            {isAnnotationLayerVisible && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <AnnotationLayer
                  ref={annotationLayerRef}
                  activeTool={activeTool}
                  onFinish={() => {
                    setActiveTool("select");
                  }}
                  initialJSON={annotationSnapshot}
                  className="pointer-events-auto"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    // Keep pointer-events auto to allow selecting/moving saved objects
                    // pointerEvents: "auto",
                    pointerEvents: activeTool === "select" ? "none" : "auto",
                  }}
                />
              </div>
            )}

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
            <div className="absolute bottom-20 left-4 z-20">
              <RunButton runCode={runCode} onToggle={setRunCode} />
            </div>

            {/* Zoom Indicator - positioned on the right side before sidebar */}
            <div className="absolute top-4 right-22 z-20">
              <ZoomIndicator
                currentZoom={canvasControls.transform.scale}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onZoomChange={canvasControls.setZoom}
                onResetZoom={canvasControls.resetZoom}
              />
            </div>
          </div>

          {/* Right Sidebar - positioned within workflow editor height */}
          <SidebarRight
            requestsPerSecond={requestsPerSecond}
            onRequestsPerSecondChange={setRequestsPerSecond}
            nodes={nodes}
            onAddNode={addNode}
            onUpdateNode={updateNode}
          />
        </div>

        {!isFullscreen && (
          <WorkflowFooter nodeCount={nodes.length} edgeCount={edges.length} />
        )}
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

const AnimatedWorkflowEditor: React.FC = () => {
  return (
    <FullscreenProvider>
      <CanvasControlsProvider>
        <WorkflowEditorContent />
      </CanvasControlsProvider>
    </FullscreenProvider>
  );
};

export default AnimatedWorkflowEditor;
