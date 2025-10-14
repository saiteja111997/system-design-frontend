import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleButtonProps } from "@/types/workflow-editor/sidebar-right";

const ToggleButton: React.FC<ToggleButtonProps> = ({
  sidebarExpanded,
  onToggle,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="absolute -left-3 top-24 h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
    >
      {sidebarExpanded ? (
        <ChevronRight className="w-4 h-4" />
      ) : (
        <ChevronLeft className="w-4 h-4" />
      )}
    </Button>
  );
};

export default ToggleButton;
