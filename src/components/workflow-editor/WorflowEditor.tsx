import React, { useRef } from "react";
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
import SidebarRight from "./SidebarRight";
import DockNavigation from "./DockNavigation";
import "@/styles/workflowAnimations.css";

const WorkflowEditorContent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, exitFullscreen } = useFullscreenContext();

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
    setSelectedNode,
    setDraggingNode,
    setDragOffset,
    setConnecting,
    setTempLine,
    setRequestsPerSecond,
    addNode,
    deleteNode,
    deleteEdge,
    addEdge,
    updateNodePosition,
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
    onClick: handleNodeClick,
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
            />

            {/* Dock Navigation - positioned in top-left of workflow editor */}
            <DockNavigation
              collapsible={false}
              position="top-left"
              responsive="top-left"
            />
          </div>

          {/* Right Sidebar - positioned within workflow editor height */}
          <SidebarRight
            requestsPerSecond={requestsPerSecond}
            onRequestsPerSecondChange={setRequestsPerSecond}
          />
        </div>

        {!isFullscreen && (
          <WorkflowFooter nodeCount={nodes.length} edgeCount={edges.length} />
        )}
      </div>
    </>
  );

  return (
    <WorkflowProvider
      requestsPerSecond={requestsPerSecond}
      setRequestsPerSecond={setRequestsPerSecond}
    >
      <CanvasControlsProvider>
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
      </CanvasControlsProvider>
    </WorkflowProvider>
  );
};

const AnimatedWorkflowEditor: React.FC = () => {
  return (
    <FullscreenProvider>
      <WorkflowEditorContent />
    </FullscreenProvider>
  );
};

export default AnimatedWorkflowEditor;
