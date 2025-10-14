"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface DockItem {
  id: string;
  name: string;
  tooltip: string;
  route?: string;
  component: React.ReactNode;
  content?: React.ReactNode; // Optional content for sidebar usage
}

interface DockNavigationProps {
  activeTool?: string;
  position?: "top" | "bottom" | "left" | "right" | "top-left";
  collapsible?: boolean;
  responsive?: "top" | "bottom" | "left" | "right" | "top-left";
  items: DockItem[]; // Accept items as prop
  onItemClick?: (itemId: string, index: number) => void; // Optional custom click handler
  onMouseEnter?: (index: number) => void; // Optional mouse enter handler
  onMouseLeave?: () => void; // Optional mouse leave handler
  className?: string; // Additional custom classes
}

const DockNavigation: React.FC<DockNavigationProps> = ({
  position = "bottom",
  collapsible = false,
  responsive = "bottom",
  items,
  onItemClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
  activeTool,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDockVisible, setDockVisible] = useState(!collapsible);
  const [currentPosition, setCurrentPosition] = useState(position);

  const handleMouseEnter = (index: number) => {
    setHoverIndex(index);
    onMouseEnter?.(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onMouseLeave?.();
  };

  const handleParentMouseEnter = () => {
    if (collapsible) {
      setDockVisible(true);
    }
  };

  const handleParentMouseLeave = () => {
    if (collapsible) {
      setDockVisible(false);
    }
  };

  const handleItemClick = (itemId: string, index: number) => {
    onItemClick?.(itemId, index);
  };

  useEffect(() => {
    const updatePosition = () => {
      if (responsive && window.innerWidth <= 768) {
        setCurrentPosition(responsive);
      } else {
        setCurrentPosition(position);
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [position, responsive, collapsible]);

  const getItemTransform = (index: number) => {
    if (hoverIndex === index) {
      switch (currentPosition) {
        case "left":
          return { scale: 1.2, x: 3, y: 0 };
        case "right":
          return { scale: 1.2, x: -3, y: 0 };
        case "top":
          return { scale: 1.2, x: 0, y: 3 };
        case "bottom":
          return { scale: 1.2, x: 0, y: -3 };
        case "top-left":
          return { scale: 1.2, x: 3, y: 3 }; // Move slightly right and down from corner
        default:
          return { scale: 1.2, x: 0, y: 0 };
      }
    } else if (hoverIndex !== null && Math.abs(hoverIndex - index) === 1) {
      return { scale: 1.12, x: 0, y: 0 };
    } else {
      return { scale: 1, x: 0, y: 0 };
    }
  };

  // Get position classes for the container
  const getContainerClasses = () => {
    const baseClasses = "absolute z-20";
    switch (currentPosition) {
      case "left":
        return `${baseClasses} left-4 top-1/2 -translate-y-1/2`;
      case "right":
        return `${baseClasses} right-4 top-1/2 -translate-y-1/2`;
      case "top":
        return `${baseClasses} top-4 left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`;
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      default:
        return baseClasses;
    }
  };

  // Get dock layout classes
  const getDockClasses = () => {
    const baseClasses =
      "flex items-center justify-center p-2 gap-[6px] bg-white/20 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md border border-slate-900/5 border-slate-900/20 dark:border-white/10 rounded-xl shadow-l dark:shadow-2xl";
    const layoutClass =
      currentPosition === "left" ||
      currentPosition === "right" ||
      currentPosition === "top-left"
        ? "flex-col"
        : "flex-row";
    return `${baseClasses} ${layoutClass}`;
  };

  // Get tooltip position classes
  const getTooltipClasses = () => {
    const baseClasses =
      "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute z-50 bg-gray-100/95 bg-gray-100/95 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 text-gray-800 dark:text-white text-xs px-2 py-1 rounded font-medium whitespace-nowrap shadow-lg border border-slate-900/20 border-slate-900/20 dark:border-white/10";

    switch (currentPosition) {
      case "left":
      case "top-left":
        return `${baseClasses} left-full ml-2 top-1/2 -translate-y-1/2`;
      case "right":
        return `${baseClasses} right-full mr-2 top-1/2 -translate-y-1/2`;
      case "top":
        return `${baseClasses} top-full mt-2 left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} bottom-full mb-2 left-1/2 -translate-x-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.2 }}
      className={`${getContainerClasses()} dock-navigation ${className}`}
      onMouseEnter={handleParentMouseEnter}
      onMouseLeave={handleParentMouseLeave}
    >
      <motion.div
        className={getDockClasses()}
        initial={{ opacity: 0 }}
        animate={{ opacity: isDockVisible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {items.map((item: DockItem, index: number) => {
          // Map tool id to activeTool value
          const toolIdMap: Record<string, string> = {
            "selection-tool": "select",
            "rectangle-tool": "rectangle",
            "ellipse-tool": "circle",
            "free-draw": "freehand",
          };
          const isActive = activeTool && toolIdMap[item.id] === activeTool;
          return (
            <motion.div
              key={item.id}
              className={
                "group relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer " +
                (isActive
                  ? "bg-blue-600 dark:bg-blue-400 border-blue-700 dark:border-blue-300 shadow-lg text-white dark:text-slate-900"
                  : "bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20 hover:border-slate-900/30 dark:hover:border-white/30 text-slate-700 dark:text-white")
              }
              animate={getItemTransform(index)}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleItemClick(item.id, index)}
              title={item.tooltip}
            >
              <div className="w-full h-full flex items-center justify-center">
                {item.component}
              </div>
              {/* Tooltip */}
              <div className={getTooltipClasses()}>{item.tooltip}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default DockNavigation;
