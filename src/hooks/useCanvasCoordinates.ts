/**
 * Canvas coordinate transformation utilities
 * Handles viewport-to-canvas coordinate conversion with zoom/pan transforms
 */

import { useCallback } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";

interface UseCanvasCoordinatesProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const useCanvasCoordinates = ({
  canvasRef,
}: UseCanvasCoordinatesProps) => {
  const canvasTransform = useWorkflowStore((state) => state.canvasTransform);

  /**
   * Convert viewport coordinates to canvas coordinates
   * Accounts for canvas scale and translation transforms
   */
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) {
        return { x: clientX, y: clientY };
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      // Transform coordinates with null-safe fallback
      const {
        scale = 1,
        translateX = 0,
        translateY = 0,
      } = canvasTransform ?? {};

      // Reverse the canvas transform to get actual canvas coordinates
      const canvasX = (rawX - translateX) / scale;
      const canvasY = (rawY - translateY) / scale;

      return { x: canvasX, y: canvasY };
    },
    [canvasRef, canvasTransform]
  );

  /**
   * Convert canvas coordinates to viewport coordinates
   * Useful for positioning UI elements relative to nodes
   */
  const getViewportCoordinates = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!canvasRef.current) {
        return { x: canvasX, y: canvasY };
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const {
        scale = 1,
        translateX = 0,
        translateY = 0,
      } = canvasTransform ?? {};

      // Apply canvas transform
      const viewportX = canvasX * scale + translateX + rect.left;
      const viewportY = canvasY * scale + translateY + rect.top;

      return { x: viewportX, y: viewportY };
    },
    [canvasRef, canvasTransform]
  );

  /**
   * Check if a point in canvas coordinates is visible in the viewport
   */
  const isPointVisible = useCallback(
    (canvasX: number, canvasY: number, margin = 0) => {
      if (!canvasRef.current) return true;

      const rect = canvasRef.current.getBoundingClientRect();
      const {
        scale = 1,
        translateX = 0,
        translateY = 0,
      } = canvasTransform ?? {};

      const viewportX = canvasX * scale + translateX;
      const viewportY = canvasY * scale + translateY;

      return (
        viewportX >= -margin &&
        viewportY >= -margin &&
        viewportX <= rect.width + margin &&
        viewportY <= rect.height + margin
      );
    },
    [canvasRef, canvasTransform]
  );

  return {
    getCanvasCoordinates,
    getViewportCoordinates,
    isPointVisible,
  };
};
