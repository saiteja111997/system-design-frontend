import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SidebarHeaderProps {
  sidebarExpanded: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  sidebarExpanded,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center"
    >
      <motion.div
        initial={false}
        animate={{ scale: sidebarExpanded ? 1 : 1 }}
        className={`flex items-center ${sidebarExpanded ? "gap-3" : "gap-0"}`}
      >
        <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <motion.div
          initial={false}
          animate={{
            opacity: sidebarExpanded ? 1 : 0,
            x: sidebarExpanded ? 0 : -20,
          }}
          transition={{ duration: 0.2, delay: sidebarExpanded ? 0.15 : 0 }}
          className={`overflow-hidden ${sidebarExpanded ? "block" : "hidden"}`}
        >
          <h1 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
            System Design
          </h1>
          <p className="text-xs text-slate-500 whitespace-nowrap">Pro Plan</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
