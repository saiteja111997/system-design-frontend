import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronUp, LogOut, Settings, User } from "lucide-react";

interface SidebarFooterProps {
  sidebarExpanded: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  sidebarExpanded,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="px-2.5 py-3 border-t border-slate-200 dark:border-slate-800"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`${
              sidebarExpanded
                ? "w-full justify-between h-9 px-3"
                : "w-10 h-10 p-0 justify-center"
            } rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <div
              className={`flex items-center ${
                sidebarExpanded ? "gap-2.5" : "justify-center"
              }`}
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-white">
                  FM
                </AvatarFallback>
              </Avatar>
              {sidebarExpanded && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Farhan M
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    farhan@example.com
                  </span>
                </div>
              )}
            </div>
            {sidebarExpanded && (
              <ChevronUp className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={sidebarExpanded ? "end" : "start"}
          className="w-52"
        >
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};
