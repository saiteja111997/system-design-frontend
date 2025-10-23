"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SidebarRightItem } from "@/types/workflow-studio/sidebar-right";

interface DockComponentProps {
  activeItem?: string | null;
  position?: "top" | "bottom" | "left" | "right" | "top-left";
  collapsible?: boolean;
  responsive?: "top" | "bottom" | "left" | "right" | "top-left";
  direction?: "horizontal" | "vertical"; // New prop to control layout direction
  tooltipPosition?: "left" | "right" | "top" | "bottom"; // New prop to control tooltip placement
  items: SidebarRightItem[]; // Accept items as prop
  onItemClick?: (itemId: string, index: number) => void; // Optional custom click handler
  onMouseEnter?: (index: number) => void; // Optional mouse enter handler
  onMouseLeave?: () => void; // Optional mouse leave handler
  className?: string; // Additional custom classes
  idMapping?: Record<string, string>; // Optional mapping for active state detection
}

// Map external dock item ids to internal activeItem identifiers
// Keeping this at module scope avoids re-allocating the object on every render & within each map iteration.
const TOOL_ID_MAP: Record<string, string> = {
  "selection-tool": "select",
  "rectangle-tool": "rectangle",
  "ellipse-tool": "circle",
  "free-draw": "freedraw",
};

const DockComponent: React.FC<DockComponentProps> = ({
  position,
  collapsible = false,
  responsive,
  direction,
  tooltipPosition,
  items,
  onItemClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
  activeItem,
  idMapping,
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
    // Disable transform animations when no position is specified (in document flow)
    if (!currentPosition) {
      return hoverIndex === index
        ? { scale: 1.1, x: 0, y: 0 }
        : { scale: 1, x: 0, y: 0 };
    }

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
    // If no position is defined, use relative positioning (flow with document)
    if (!currentPosition) {
      return "relative z-20";
    }

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

    // Determine layout direction
    let layoutClass;
    if (direction) {
      // Use explicit direction prop if provided
      layoutClass = direction === "vertical" ? "flex-col" : "flex-row";
    } else {
      // Fall back to position-based logic
      layoutClass =
        currentPosition === "left" ||
        currentPosition === "right" ||
        currentPosition === "top-left"
          ? "flex-col"
          : "flex-row"; // Default to flex-row when no position or horizontal positions
    }

    return `${baseClasses} ${layoutClass}`;
  };

  // Get tooltip position classes
  const getTooltipClasses = () => {
    const baseClasses =
      "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute z-[99999999] bg-gray-100/95 bg-gray-100/95 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 text-gray-800 dark:text-white text-xs px-2 py-1 rounded font-medium whitespace-nowrap shadow-lg border border-slate-900/20 border-slate-900/20 dark:border-white/10";

    // Use explicit tooltipPosition if provided
    if (tooltipPosition) {
      switch (tooltipPosition) {
        case "left":
          return `${baseClasses} right-full mr-2 top-1/2 -translate-y-1/2`;
        case "right":
          return `${baseClasses} left-full ml-2 top-1/2 -translate-y-1/2`;
        case "top":
          return `${baseClasses} bottom-full mb-2 left-1/2 -translate-x-1/2`;
        case "bottom":
          return `${baseClasses} top-full mt-2 left-1/2 -translate-x-1/2`;
        default:
          return baseClasses;
      }
    }

    // Fall back to position-based logic when no explicit tooltipPosition
    if (!currentPosition) {
      return `${baseClasses} bottom-full mb-2 left-1/2 -translate-x-1/2`;
    }

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
        {items.map((item: SidebarRightItem, index: number) => {
          // Determine if current item matches active tool
          const mappingToUse = idMapping || TOOL_ID_MAP;
          const isActive =
            (!!activeItem && mappingToUse[item.id] === activeItem) ||
            item.id === activeItem;
          return (
            <motion.div
              key={item.id}
              className={
                "group relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer " +
                (isActive
                  ? "bg-primary dark:bg-primary border-purple-700 dark:border-primary shadow-lg !text-white dark:text-slate-900"
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

export default DockComponent;
