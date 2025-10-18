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

const WorkflowEditorContent: React.FC = () => {
  // Store entire history stack for proper undo/redo across transitions
  const [annotationHistory, setAnnotationHistory] = useState<{
    history: CanvasState[];
    currentIndex: number;
  } | null>(null);
  const [annotationSnapshot, setAnnotationSnapshot] =
    useState<CanvasState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const annotationLayerRef = useRef<
    import("./AnnotationLayer").AnnotationLayerHandle | null
  >(null);

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
   * Strategy: Save BOTH snapshot AND history BEFORE fullscreen state changes,
   * then restore AFTER canvas is fully mounted and ready in the new state
   */
  useEffect(() => {
    // Only run when fullscreen state actually changes
    const currentAnnotationRef = annotationLayerRef.current;

    if (!currentAnnotationRef) return;

    if (isFullscreen) {
      // Entering fullscreen: Restore the previously saved snapshot AND history
      // Use setTimeout to ensure canvas is fully mounted and ready
      const timer = setTimeout(() => {
        if (annotationLayerRef.current) {
          // First try to restore the history stack
          if (annotationHistory) {
            try {
              annotationLayerRef.current.importHistory(annotationHistory);
            } catch (error) {
              console.error(
                "[WorkflowStudio] Failed to restore history on fullscreen enter:",
                error
              );
              // Fallback: if history import fails, try loading the snapshot
              if (annotationSnapshot) {
                annotationLayerRef.current
                  .load(annotationSnapshot)
                  .then(() => {
                    // Always force redraw after restore
                    const canvas = annotationLayerRef.current?.getCanvas();
                    canvas?.renderAll();
                  })
                  .catch((fallbackError: unknown) => {
                    console.error(
                      "[WorkflowStudio] Failed to restore annotations on fullscreen enter (fallback):",
                      fallbackError
                    );
                  });
              }
            }
          } else if (annotationSnapshot) {
            // Fallback: if no history, just load the snapshot
            annotationLayerRef.current
              .load(annotationSnapshot)
              .then(() => {
                // Always force redraw after restore
                const canvas = annotationLayerRef.current?.getCanvas();
                canvas?.renderAll();
              })
              .catch((error: unknown) => {
                console.error(
                  "[WorkflowStudio] Failed to restore annotations on fullscreen enter:",
                  error
                );
              });
          }
        }
      }, 150); // Small delay to ensure canvas initialization completes

      return () => clearTimeout(timer);
    }
    // Note: Exiting fullscreen is handled by the save function below
  }, [isFullscreen, annotationSnapshot, annotationHistory]);

  /**
   * Save annotation state before any fullscreen transition
   * This runs synchronously before the fullscreen change propagates
   */
  const handleFullscreenToggle = useCallback(() => {
    // Save current state AND history immediately before transition
    if (annotationLayerRef.current) {
      try {
        // Save current canvas snapshot (for fallback)
        const snapshot = annotationLayerRef.current.snapshot();
        if (snapshot) {
          setAnnotationSnapshot(snapshot);
        }

        // Save entire history stack (for undo/redo preservation)
        const history = annotationLayerRef.current.exportHistory();
        if (history) {
          setAnnotationHistory(history);
        }
      } catch (error) {
        console.error(
          "[WorkflowStudio] Failed to save annotations before fullscreen toggle:",
          error
        );
      }
    }

    // Proceed with fullscreen toggle
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Handle confirmed clear action
  const handleConfirmedClear = useCallback(() => {
    annotationLayerRef.current?.clear();
    setShowClearDialog(false);
  }, []);

  // Canvas controls - clean and simple!
  const canvasControls = useCanvasControlsContext();
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
      },
      redo: () => {
        annotationLayerRef.current?.redo();
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
              activeTool={activeTool}
              isAnnotationLayerVisible={isAnnotationLayerVisible}
              annotationSnapshot={annotationSnapshot}
              annotationLayerRef={annotationLayerRef}
              onAnnotationToolChange={setActiveTool}
              onAnnotationSnapshotChange={setAnnotationSnapshot}
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
              onClick={exitFullscreen}
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
