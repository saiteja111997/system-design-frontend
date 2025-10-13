"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface FullscreenContextType {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(
  undefined
);

export const useFullscreenContext = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error(
      "useFullscreenContext must be used within a FullscreenProvider"
    );
  }
  return context;
};

interface FullscreenProviderProps {
  children: ReactNode;
}

export const FullscreenProvider: React.FC<FullscreenProviderProps> = ({
  children,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <FullscreenContext.Provider
      value={{
        isFullscreen,
        toggleFullscreen,
        exitFullscreen,
      }}
    >
      {children}
    </FullscreenContext.Provider>
  );
};
