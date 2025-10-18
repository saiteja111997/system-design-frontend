"use client";

import { useState } from "react";
import { DashboardView } from "@/components/main-tabs/dashboard/DashboardView";
import { NewVideoView } from "@/components/main-tabs/new-video-view/NewVideoView";
import { AIResearchView } from "@/components/main-tabs/ai-assistant/AIResearchView";
import { AnalyticsView } from "@/components/main-tabs/analytics/AnalyticsView";
import { MainLayout } from "@/components/MainLayout";
import AnimatedWorkflowEditor from "@/components/workflow-editor/WorflowStudio";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("system-design");

  const renderPage = () => {
    switch (currentPage) {
      case "my-progress":
        return <DashboardView onNavigate={setCurrentPage} />;
      case "bug-practice":
        return <NewVideoView />;
      case "system-design":
        return <AnimatedWorkflowEditor />;
      case "challenges":
        return <AnalyticsView />;
      case "recruiter-assessment":
        return <AIResearchView />;
      case "settings":
        return <AnalyticsView />;
      default:
        return <AnimatedWorkflowEditor />;
    }
  };
  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}
