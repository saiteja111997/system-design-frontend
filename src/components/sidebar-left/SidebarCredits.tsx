import { motion } from "framer-motion";
import { CreditCard, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

interface SidebarCreditsProps {
  sidebarExpanded: boolean;
}

export const SidebarCredits: React.FC<SidebarCreditsProps> = ({
  sidebarExpanded,
}) => {
  const [credits] = useState(850);

  return (
    <>
      {sidebarExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pt-5 my-5 border-t border-slate-200 dark:border-slate-800 w-full px-2.5"
        >
          <div className="bg-purple-300/10 dark:bg-purple-950/10 rounded-lg p-4 border border-primary/40 dark:border-primary/80 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="flex justify-center items-center gap-2 text-xs font-medium text-slate-900 dark:text-white">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Credits
              </span>
              <CreditCard className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-xl font-bold text-primary dark:text-white mb-2.5">
              {credits}
            </div>
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-gray-200 text-xs font-bold h-8"
            >
              Add More
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
};
