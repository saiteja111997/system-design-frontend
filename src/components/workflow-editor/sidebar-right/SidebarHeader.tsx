import React from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { SidebarHeaderProps } from "@/types/workflow-editor/sidebar-right";

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ sidebarExpanded }) => {
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
        <div className="w-11 h-11 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <motion.div
          initial={false}
          animate={{
            opacity: sidebarExpanded ? 1 : 0,
            width: sidebarExpanded ? "auto" : 0,
            x: sidebarExpanded ? 0 : -20,
          }}
          transition={{
            duration: 0.25,
            delay: sidebarExpanded ? 0.1 : 0,
            ease: "easeInOut",
          }}
          className="overflow-hidden"
        >
          <h1 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
            Panel
          </h1>
          <p className="text-xs text-slate-500 whitespace-nowrap">
            Tools & Settings
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SidebarHeader;
