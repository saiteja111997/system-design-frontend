import React, { forwardRef, useEffect, useRef, useCallback } from "react";
import { WorkflowCanvasProps } from "@/types/workflow-studio";
import { WorkflowLayer } from "./workflow-layer/WorkflowLayer";
import { CanvasGrid } from "./CanvasGrid";
import { AnnotationLayer, type Tool } from "./annotation-layer";
import type { CanvasState } from "@/utils/annotationUtils";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkflowCanvasWithAnnotationProps extends WorkflowCanvasProps {
  // Simple annotation props - no complexity!
  activeTool?: Tool;
  isAnnotationLayerVisible?: boolean;
  annotationLayerRef?: React.MutableRefObject<
    import("./annotation-layer").AnnotationLayerHandle | null
  >;
  onAnnotationToolChange?: (tool: Tool) => void;
  onAnnotationSnapshotChange?: (snapshot: CanvasState | null) => void;
}

export const WorkflowCanvas = forwardRef<
  HTMLDivElement,
  WorkflowCanvasWithAnnotationProps
>(
  (
    {
      nodes,
      edges,
      tempLine,
      selectedNode,
      selectedEdge,
      draggingNode,
      nodeHandlers,
      edgeHandlers,
      onMouseMove,
      onMouseUp,
      runCode = false,
      // Simple annotation props
      activeTool = "select",
      isAnnotationLayerVisible = false,
      annotationLayerRef,
      onAnnotationToolChange,
      onAnnotationSnapshotChange,
    },
    ref
  ) => {
    const {
      handlePanStart,
      handlePanMove,
      handlePanEnd,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleWheel,
      getCanvasTransformStyle,
    } = useCanvasControlsContext();

    // Internal ref for annotation layer
    const internalAnnotationRef = useRef<
      import("./annotation-layer").AnnotationLayerHandle | null
    >(null);

    // Connect internal ref to parent ref whenever the annotation layer component changes
    useEffect(() => {
      if (annotationLayerRef) {
        annotationLayerRef.current = internalAnnotationRef.current;
      }
    }, [annotationLayerRef]);

    // Also create a callback ref to ensure immediate connection when AnnotationLayer mounts
    const handleAnnotationLayerRef = useCallback(
      (element: import("./annotation-layer").AnnotationLayerHandle | null) => {
        internalAnnotationRef.current = element;
        if (annotationLayerRef) {
          annotationLayerRef.current = element;
        }
      },
      [annotationLayerRef]
    );

    const handleMouseDown = (event: React.MouseEvent) => {
      // Don't start panning if annotation layer is active and not in select mode
      if (isAnnotationLayerVisible && activeTool !== "select") {
        return;
      }
      handlePanStart(event);
    };

    const handleMouseMoveCanvas = (event: React.MouseEvent) => {
      // Don't pan if annotation layer is active and not in select mode
      if (isAnnotationLayerVisible && activeTool !== "select") {
        onMouseMove?.(event);
        return;
      }
      handlePanMove(event);
      onMouseMove?.(event);
    };

    const handleMouseUpCanvas = () => {
      // Don't end panning if annotation layer is active and not in select mode
      if (isAnnotationLayerVisible && activeTool !== "select") {
        onMouseUp?.();
        return;
      }
      handlePanEnd();
      onMouseUp?.();
    };

    // Attach native touch listeners with passive: false for preventDefault
    useEffect(() => {
      const canvasDiv = ref && typeof ref !== "function" ? ref.current : null;
      if (!canvasDiv) return;

      const nativeTouchStart = (e: TouchEvent) => {
        // Cast native TouchEvent to React TouchEvent via unknown
        handleTouchStart(e as unknown as React.TouchEvent<Element>);
      };

      const nativeTouchMove = (e: TouchEvent) => {
        handleTouchMove(e as unknown as React.TouchEvent<Element>);
      };

      const nativeTouchEnd = (e: TouchEvent) => {
        handleTouchEnd(e as unknown as React.TouchEvent<Element>);
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

    const handleAnnotationFinish = () => {
      onAnnotationToolChange?.("select");
      // Save snapshot when finishing drawing
      const snapshot = internalAnnotationRef.current?.snapshot();
      if (snapshot) {
        onAnnotationSnapshotChange?.(snapshot);
      }
    };

    return (
      <motion.div
        ref={ref}
        data-canvas-area="true"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "canvas-container flex-1 relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
          isAnnotationLayerVisible && activeTool !== "select"
            ? "cursor-crosshair"
            : "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onWheel={(e) => {
          // Don't zoom if annotation layer is active and not in select mode
          if (isAnnotationLayerVisible && activeTool !== "select") {
            return;
          }
          handleWheel(e);
        }}
      >
        {/* Fixed background grid */}
        <CanvasGrid />

        {/* Transform container - only workflow layer scales/moves */}
        <div
          className="flex justify-center items-center workflow-and-annotation-container absolute z-20 inset-0 !w-full !h-full"
          style={getCanvasTransformStyle()}
        >
            {/* Workflow Layer - handles nodes, edges */}
            <WorkflowLayer
              nodes={nodes}
              edges={edges}
              tempLine={tempLine}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              draggingNode={draggingNode}
              nodeHandlers={nodeHandlers}
              edgeHandlers={edgeHandlers}
              runCode={runCode}
            />

            {/* Annotation Layer - covers full viewport but content scales with canvas */}
            {isAnnotationLayerVisible && (
              <AnnotationLayer
                key="annotation-layer-stable"
                ref={handleAnnotationLayerRef}
                activeTool={activeTool}
                onFinish={handleAnnotationFinish}
                className={cn(
                  "absolute inset-0 w-full h-full",
                  activeTool === "select"
                    ? "pointer-events-none"
                    : "pointer-events-auto"
                )}
              />
            )}
        </div>
      </motion.div>
    );
  }
);

WorkflowCanvas.displayName = "WorkflowCanvas";
