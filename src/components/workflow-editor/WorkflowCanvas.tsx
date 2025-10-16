import React, { forwardRef } from "react";
import { WorkflowCanvasProps } from "@/types/workflow-editor/components";
import { CanvasGrid } from "./CanvasGrid";
import { SvgDefinitions } from "./SvgDefinitions";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";
import { TempConnectionLine } from "./TempConnectionLine";
import { useWorkflowAnimation } from "@/hooks/useWorkflowAnimation";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";

export const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  (
    {
      nodes,
      edges,
      tempLine,
      selectedNode,
      draggingNode,
      nodeHandlers,
      edgeHandlers,
      onMouseMove,
      onMouseUp,
      runCode = false, // Add runCode prop with default false
    },
    ref
  ) => {
    const { globalAnimationStyle } = useWorkflowAnimation();
    const {
      handlePanStart,
      handlePanMove,
      handlePanEnd,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleWheel,
      getTransformStyle,
    } = useCanvasControlsContext();

    const handleMouseDown = (event: React.MouseEvent) => {
      handlePanStart(event);
    };

    const handleMouseMoveCanvas = (event: React.MouseEvent) => {
      handlePanMove(event);
      onMouseMove?.(event);
    };

    const handleMouseUpCanvas = () => {
      handlePanEnd();
      onMouseUp?.();
    };

    // Attach native touch listeners with passive: false for preventDefault

    React.useEffect(() => {
      const canvasDiv = ref && typeof ref !== "function" ? ref.current : null;
      if (!canvasDiv) return;
      // Wrap native event to call React handler
      // Fabric.js and React expect slightly different event types; we only need touches and preventDefault
      // This wrapper passes the native event to the React handler, which only uses touches and preventDefault
      const nativeTouchStart = (e: TouchEvent) => {
        // @ts-expect-error: React handler expects React.TouchEvent, but only uses touches/preventDefault
        handleTouchStart(e);
      };
      const nativeTouchMove = (e: TouchEvent) => {
        // @ts-expect-error: React handler expects React.TouchEvent, but only uses touches/preventDefault
        handleTouchMove(e);
      };
      const nativeTouchEnd = (e: TouchEvent) => {
        // @ts-expect-error: React handler expects React.TouchEvent, but only uses touches/preventDefault
        handleTouchEnd(e);
      };
      canvasDiv.addEventListener("touchstart", nativeTouchStart, {
        passive: false,
      });
      canvasDiv.addEventListener("touchmove", nativeTouchMove, {
        passive: false,
      });
      canvasDiv.addEventListener("touchend", nativeTouchEnd, {
        passive: false,
      });
      return () => {
        canvasDiv.removeEventListener("touchstart", nativeTouchStart);
        canvasDiv.removeEventListener("touchmove", nativeTouchMove);
        canvasDiv.removeEventListener("touchend", nativeTouchEnd);
      };
    }, [ref, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return (
      <div
        ref={ref}
        data-canvas-area="true"
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onWheel={handleWheel}
        style={globalAnimationStyle}
      >
        {/* Fixed grid that doesn't zoom */}
        <CanvasGrid />

        {/* SVG for edges - positioned to match transformed content */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <SvgDefinitions />
          </defs>
          <g style={getTransformStyle()}>
            {/* Existing edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              return (
                <WorkflowEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  handlers={edgeHandlers}
                  runCode={runCode}
                />
              );
            })}

            {/* Temporary connection line */}
            {tempLine && <TempConnectionLine tempLine={tempLine} />}
          </g>
        </svg>

        {/* Transformable canvas content */}
        <div
          className="absolute inset-0 w-full h-full"
          style={getTransformStyle()}
        >
          {/* Nodes */}
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              isDragging={draggingNode === node.id}
              handlers={nodeHandlers}
            />
          ))}
        </div>
      </div>
    );
  }
);

WorkflowCanvas.displayName = "WorkflowCanvas";
