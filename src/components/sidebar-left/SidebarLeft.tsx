import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarCredits } from "./SidebarCredits";
import { SidebarFooter } from "./SidebarFooter";

interface SidebarLeftProps {
  sidebarExpanded: boolean;
  showTooltips: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
  handleToggleSidebar: () => void;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({
  sidebarExpanded,
  showTooltips,
  currentPage,
  onNavigate,
  handleToggleSidebar,
}) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarExpanded ? 264 : 74 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col relative"
    >
      <SidebarHeader sidebarExpanded={sidebarExpanded} />

      <SidebarNavigation
        sidebarExpanded={sidebarExpanded}
        showTooltips={showTooltips}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <SidebarCredits sidebarExpanded={sidebarExpanded} />

      <SidebarFooter sidebarExpanded={sidebarExpanded} />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleSidebar}
        className="absolute -right-3 top-24 h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
      >
        {sidebarExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </motion.aside>
  );
};

export default SidebarLeft;
