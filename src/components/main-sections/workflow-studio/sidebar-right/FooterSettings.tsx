import React from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FooterSettingsProps } from "@/types/workflow-studio/sidebar-right";

const FooterSettings: React.FC<FooterSettingsProps> = ({ sidebarExpanded }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="p-4 px-3 border-t border-slate-200 dark:border-slate-800"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Button
          variant="ghost"
          className={`h-11 w-full rounded-xl ${
            sidebarExpanded
              ? "justify-start gap-3 px-4"
              : "justify-center gap-0 px-0"
          } hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
        >
          <Settings className="w-5 h-5 flex-shrink-0 text-slate-600 dark:text-slate-400" />
          <motion.span
            initial={false}
            animate={{
              opacity: sidebarExpanded ? 1 : 0,
              width: sidebarExpanded ? "auto" : 0,
              x: sidebarExpanded ? 0 : -10,
            }}
            transition={{
              duration: 0.25,
              delay: sidebarExpanded ? 0.1 : 0,
              ease: "easeInOut",
            }}
            className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300 overflow-hidden"
          >
            Settings
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default FooterSettings;
