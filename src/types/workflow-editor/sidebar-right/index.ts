import { Node } from "../workflow";

// Main SidebarRight Props
export interface SidebarRightProps {
  requestsPerSecond: number;
  onRequestsPerSecondChange: (value: number) => void;
  nodes?: Node[];
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
  }) => void;
  onUpdateNode?: (
    nodeId: number,
    updates: { label: string; icon: string }
  ) => void;
}

// Header Component Props
export interface SidebarHeaderProps {
  sidebarExpanded: boolean;
}

// Navigation Tabs Props
export interface NavigationTabsProps {
  sidebarExpanded: boolean;
  selectedTab: string;
  onTabChange: (tabId: string) => void;
}

// Main Content Area Props
export interface MainContentAreaProps {
  sidebarExpanded: boolean;
  selectedTab: string;
  nodes: Node[];
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
  }) => void;
  onUpdateNode?: (
    nodeId: number,
    updates: { label: string; icon: string }
  ) => void;
  requestsPerSecond: number;
  onRequestsPerSecondChange: (value: number) => void;
}

// Add Node Content Props
export interface AddNodeContentProps {
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
  }) => void;
}

// Edit Node Content Props
export interface EditNodeContentProps {
  nodes: Node[];
  onUpdateNode?: (
    nodeId: number,
    updates: { label: string; icon: string }
  ) => void;
}

// Analytics Content Props
export interface AnalyticsContentProps {
  // Future analytics props will be added here
  placeholder?: never; // Temporary to avoid empty interface
}

// Metrics Content Props
export interface MetricsContentProps {
  requestsPerSecond: number;
  onRequestsPerSecondChange: (value: number) => void;
}

// Collapsed State Props
export interface CollapsedStateProps {
  requestsPerSecond: number;
}

// Toggle Button Props
export interface ToggleButtonProps {
  sidebarExpanded: boolean;
  onToggle: () => void;
}

// Footer Settings Props
export interface FooterSettingsProps {
  sidebarExpanded: boolean;
}
