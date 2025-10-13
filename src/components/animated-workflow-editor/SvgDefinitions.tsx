import React from "react";

/**
 * SVG definitions component - only handles SVG elements
 * CSS animations are now in separate CSS module
 */
export const SvgDefinitions: React.FC = () => {
  return (
    <defs>
      {/* Gradient for animated edges - Blue (0-500 RPS) */}
      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
        <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
      </linearGradient>

      {/* Gradient for medium load - Yellow (500-5000 RPS) */}
      <linearGradient id="flowGradientYellow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
        <stop offset="30%" stopColor="#facc15" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#facc15" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </linearGradient>

      {/* Gradient for high load - Red (5000-50000 RPS) */}
      <linearGradient id="flowGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
        <stop offset="30%" stopColor="#ef4444" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#ef4444" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
      </linearGradient>

      {/* Glow filter */}
      <filter id="edgeGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Arrow marker */}
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9" />
      </marker>

      {/* Styles for edge background strokes only */}
      <style>{`
        :root {
          --edge-bg-stroke: rgba(203, 213, 225, 0.3);
        }
        
        .dark {
          --edge-bg-stroke: rgba(30, 41, 59, 0.5);
        }
      `}</style>
    </defs>
  );
};
