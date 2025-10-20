import React, { forwardRef, useEffect, useRef, useCallback } from "react";
import { WorkflowCanvasProps } from "@/types/workflow-editor/components";
import { WorkflowLayer } from "./WorkflowLayer";
import { CanvasGrid } from "./CanvasGrid";
import { AnnotationLayer, type Tool } from "./AnnotationLayer";
import type { CanvasState } from "@/utils/annotationUtils";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { motion } from "framer-motion";

interface WorkflowCanvasWithAnnotationProps extends WorkflowCanvasProps {
  // Simple annotation props - no complexity!
  activeTool?: Tool;
  isAnnotationLayerVisible?: boolean;
  annotationLayerRef?: React.MutableRefObject<
    import("./AnnotationLayer").AnnotationLayerHandle | null
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
      import("./AnnotationLayer").AnnotationLayerHandle | null
    >(null);

    // Connect internal ref to parent ref whenever the annotation layer component changes
    useEffect(() => {
      if (annotationLayerRef) {
        annotationLayerRef.current = internalAnnotationRef.current;
      }
    }, [annotationLayerRef]);

    // Also create a callback ref to ensure immediate connection when AnnotationLayer mounts
    const handleAnnotationLayerRef = useCallback(
      (element: import("./AnnotationLayer").AnnotationLayerHandle | null) => {
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
      <motion.div
        ref={ref}
        data-canvas-area="true"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex-1 relative overflow-hidden ${
          isAnnotationLayerVisible && activeTool !== "select"
            ? "cursor-crosshair"
            : "cursor-grab active:cursor-grabbing"
        } bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}
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

        {/* Transform container - both layers move/scale together with canvasTransform */}
        <div
          className="absolute inset-0 w-full h-full"
          style={getCanvasTransformStyle()}
        >
          {/* Workflow Layer - handles nodes, edges */}
          <WorkflowLayer
            nodes={nodes}
            edges={edges}
            tempLine={tempLine}
            selectedNode={selectedNode}
            draggingNode={draggingNode}
            nodeHandlers={nodeHandlers}
            edgeHandlers={edgeHandlers}
            runCode={runCode}
          />

          {/* Annotation Layer - follows same transform as workflow */}
          {isAnnotationLayerVisible && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <AnnotationLayer
                key="annotation-layer-stable"
                ref={handleAnnotationLayerRef}
                activeTool={activeTool}
                onFinish={() => {
                  onAnnotationToolChange?.("select");
                  // Save snapshot when finishing drawing
                  const snapshot = internalAnnotationRef.current?.snapshot();
                  if (snapshot) {
                    onAnnotationSnapshotChange?.(snapshot);
                  }
                }}
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
        </div>
      </motion.div>
    );
  }
);

WorkflowCanvas.displayName = "WorkflowCanvas";
