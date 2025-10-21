"use client";

import React, { forwardRef } from "react";
import type { AnnotationLayerHandle, AnnotationLayerProps } from "./types";
import { useAnnotationInternal } from "./useAnnotationInternal";
import { FallbackUI } from "./FallbackUI";
import { cn } from "@/lib/utils";

export const AnnotationLayer = forwardRef<
  AnnotationLayerHandle,
  AnnotationLayerProps
>((props, ref) => {
  const { state, api } = useAnnotationInternal(props, ref);
  if (state.initError) {
    return (
      <FallbackUI
        error={state.initError}
        retry={api.retry}
        className={props.className}
        style={props.style}
      />
    );
  }
  return (
    <div
      ref={state.containerRef}
      className={cn(
        "annotation-layer-container relative w-full h-full overflow-hidden",
        props.className
      )}
      tabIndex={0}
      role="application"
      aria-label="Drawing canvas"
    >
      <canvas ref={state.canvasRef} />
      {!state.isReady && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
          Initializing annotation layer...
        </div>
      )}
    </div>
  );
});

AnnotationLayer.displayName = "AnnotationLayer";

export default AnnotationLayer;
