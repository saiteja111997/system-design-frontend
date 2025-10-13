"use client";

import { useState } from "react";
import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from "@/components/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeToggle } from "./extras/ModeToggele";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  const handleToggleSidebar = () => {
    setShowTooltips(false);
    setSidebarExpanded(!sidebarExpanded);
    setTimeout(() => setShowTooltips(true), 400);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Sidebar
          sidebarExpanded={sidebarExpanded}
          showTooltips={showTooltips}
          currentPage={currentPage}
          onNavigate={onNavigate}
          handleToggleSidebar={handleToggleSidebar}
        />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
            <Button variant="ghost" size="icon" onClick={handleToggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
                <ModeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white">
                  3
                </Badge>
              </Button>

              <Avatar>
                <AvatarFallback className="bg-gradient-primary text-white">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
