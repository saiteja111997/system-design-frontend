"use client";
import React from "react";

interface FallbackUIProps {
  error: string;
  retry: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FallbackUI: React.FC<FallbackUIProps> = ({
  error,
  retry,
  className,
  style,
}) => (
  <div
    className={`flex flex-col items-center justify-center text-sm text-red-600 dark:text-red-400 p-4 border border-red-300 dark:border-red-700 rounded-md bg-red-50/70 dark:bg-red-900/20 ${
      className || ""
    }`}
    style={style}
  >
    <p className="font-medium mb-2">Annotation layer failed to load</p>
    <p className="opacity-80 mb-4 break-all max-w-sm text-center">{error}</p>
    <button
      onClick={retry}
      className="px-3 py-1.5 rounded bg-red-600 text-white text-xs hover:bg-red-500 transition"
    >
      Retry
    </button>
  </div>
);

export default FallbackUI;
