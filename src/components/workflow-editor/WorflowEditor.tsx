import React, { useRef, useState, useEffect } from "react";
import type { CanvasState } from "../../utils/annotationUtils";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NodeHandlers, EdgeHandlers } from "@/types/workflow-editor/workflow";
import {
  WorkflowHeader,
  WorkflowCanvas,
  WorkflowFooter,
  useWorkflowState,
  useWorkflowInteractions,
} from ".";
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
import "@/styles/workflowAnimations.css";

const WorkflowEditorContent: React.FC = () => {
  // Annotation persistence across fullscreen
  const annotationLayerRef = useRef<
    import("./AnnotationLayer").AnnotationLayerHandle | null
  >(null);
  const [annotationSnapshot, setAnnotationSnapshot] =
    useState<CanvasState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, exitFullscreen, toggleFullscreen } =
    useFullscreenContext();

  // Handle annotation persistence across fullscreen transitions
  useEffect(() => {
    if (!isFullscreen && annotationLayerRef.current) {
      // Exiting fullscreen: save the current annotation state
      const snapshot = annotationLayerRef.current.snapshot();
      if (snapshot) {
        setAnnotationSnapshot(snapshot);
      }
    } else if (
      isFullscreen &&
      annotationLayerRef.current &&
      annotationSnapshot
    ) {
      // Entering fullscreen: load the saved annotation state (only if snapshot exists)
      annotationLayerRef.current.load(annotationSnapshot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]); // Only depend on isFullscreen to avoid infinite loop when setting annotationSnapshot

  // Annotation state
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [isAnnotationLayerVisible, setIsAnnotationLayerVisible] =
    useState(false);

  // Canvas controls - now properly inside CanvasControlsProvider
  const canvasControls = useCanvasControlsContext();
  const dockHandlers = createDockItemHandlers(
    canvasControls,
    { toggleFullscreen },
    {
      setActiveTool: (tool: Tool) => {
        setActiveTool(tool);
        // Show annotation layer when a drawing tool is selected
        if (tool !== "select") {
          setIsAnnotationLayerVisible(true);
        }
      },
    }
  );

  const handleWorkflowDockItemClick = (itemId: string) => {
    handleDockItemClick(itemId, dockHandlers);
  };

  // State management
  const {
    nodes,
    edges,
    selectedNode,
    draggingNode,
    dragOffset,
    connecting,
    tempLine,
    requestsPerSecond,
    runCode,
    setSelectedNode,
    setDraggingNode,
    setDragOffset,
    setConnecting,
    setTempLine,
    setRequestsPerSecond,
    setRunCode,
    addNode,
    deleteNode,
    deleteEdge,
    addEdge,
    updateNodePosition,
    updateNode,
  } = useWorkflowState();

  // Interaction handlers
  const {
    handleNodeMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleNodeClick,
    handleStartConnection,
    handleEndConnection,
    handleDeleteNode,
  } = useWorkflowInteractions({
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
    <>
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
    </>
  );

  return (
    <>
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
      <WorkflowProvider
        requestsPerSecond={1500}
        setRequestsPerSecond={() => {}}
      >
        <CanvasControlsProvider>
          <WorkflowEditorContent />
        </CanvasControlsProvider>
      </WorkflowProvider>
    </FullscreenProvider>
  );
};

export default AnimatedWorkflowEditor;
