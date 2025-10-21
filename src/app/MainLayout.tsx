"use client";

import { useState } from "react";
import SidebarLeft from "@/components/sidebar-left/SidebarLeft";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "../components/header/Header";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MainLayout({
  children,
  currentPage,
  onNavigate,
}: MainLayoutProps) {
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
        <SidebarLeft
          sidebarExpanded={sidebarExpanded}
          showTooltips={showTooltips}
          currentPage={currentPage}
          onNavigate={onNavigate}
          handleToggleSidebar={handleToggleSidebar}
        />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Header onToggle={handleToggleSidebar} />

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
