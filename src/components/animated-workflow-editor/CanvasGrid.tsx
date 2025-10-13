import React from "react";

export const CanvasGrid: React.FC = () => {
  return (
    <div
      className="absolute inset-0 opacity-10 dark:opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
        backgroundSize: "10px 10px",
      }}
    />
  );
};
