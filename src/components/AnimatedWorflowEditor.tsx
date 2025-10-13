import React, { useRef } from "react";
import { NodeHandlers, EdgeHandlers } from "@/types/workflow";
import {
  WorkflowHeader,
  WorkflowCanvas,
  WorkflowFooter,
  WorkflowEditorSummary,
  useWorkflowState,
  useWorkflowInteractions,
} from "./animated-workflow-editor";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import "@/styles/workflowAnimations.css";

const AnimatedWorkflowEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  return (
    <WorkflowProvider
      requestsPerSecond={requestsPerSecond}
      setRequestsPerSecond={setRequestsPerSecond}
    >
      <div
        className="flex flex-col h-screen select-none bg-white dark:bg-slate-950"
        onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        <WorkflowHeader onAddNode={addNode} />

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

        <WorkflowFooter nodeCount={nodes.length} edgeCount={edges.length} />

        <WorkflowEditorSummary
          value={requestsPerSecond}
          onChange={setRequestsPerSecond}
        />
      </div>
    </WorkflowProvider>
  );
};

export default AnimatedWorkflowEditor;
