import {
  Smartphone,
  Router,
  Users,
  CreditCard,
  Network,
  Server,
  Database,
  Globe,
  Shield,
  Search,
  HardDrive,
  Zap,
  Monitor,
  Activity,
  Link,
} from "lucide-react";

export interface NodeTypeOption {
  id: string;
  label: string;
  icon: string;
  category: string;
  component: React.ReactNode;
}

export interface NodePositionType {
  id: string;
  label: string;
  description: string;
}

// Available categories
export const nodeCategories = [
  "Entry Layer",
  "Routing & Compute",
  "Data & Storage",
  "Performance & Access",
  "Monitoring & Infra",
];

// Node position types
export const nodePositionTypes: NodePositionType[] = [
  {
    id: "start",
    label: "Start Node",
    description: "Entry point of the workflow",
  },
  {
    id: "process",
    label: "Process Node",
    description: "Processing component in the workflow",
  },
  {
    id: "end",
    label: "End Node",
    description: "Terminal point of the workflow",
  },
];

export const nodeTypeOptions: NodeTypeOption[] = [
  // Entry Layer
  {
    id: "client",
    label: "Client / User Node",
    icon: "Smartphone",
    category: "Entry Layer",
    component: <Smartphone size={16} className="text-blue-600" />,
  },
  {
    id: "dns",
    label: "DNS Resolver",
    icon: "Globe",
    category: "Entry Layer",
    component: <Globe size={16} className="text-green-600" />,
  },
  {
    id: "gateway",
    label: "API Gateway",
    icon: "Router",
    category: "Entry Layer",
    component: <Router size={16} className="text-purple-600" />,
  },

  // Routing & Compute
  {
    id: "load-balancer",
    label: "Load Balancer",
    icon: "Network",
    category: "Routing & Compute",
    component: <Network size={16} className="text-orange-600" />,
  },
  {
    id: "sync-compute",
    label: "Synchronous Compute Node",
    icon: "Server",
    category: "Routing & Compute",
    component: <Server size={16} className="text-blue-500" />,
  },
  {
    id: "async-compute",
    label: "Asynchronous Compute Node",
    icon: "Zap",
    category: "Routing & Compute",
    component: <Zap size={16} className="text-yellow-500" />,
  },
  {
    id: "message-queue",
    label: "Message Queue",
    icon: "Activity",
    category: "Routing & Compute",
    component: <Activity size={16} className="text-red-500" />,
  },

  // Data & Storage
  {
    id: "database",
    label: "Database",
    icon: "Database",
    category: "Data & Storage",
    component: <Database size={16} className="text-green-500" />,
  },
  {
    id: "cache",
    label: "Cache",
    icon: "HardDrive",
    category: "Data & Storage",
    component: <HardDrive size={16} className="text-blue-400" />,
  },
  {
    id: "object-storage",
    label: "Object Storage",
    icon: "HardDrive",
    category: "Data & Storage",
    component: <HardDrive size={16} className="text-gray-500" />,
  },
  {
    id: "search-service",
    label: "Search Service",
    icon: "Search",
    category: "Data & Storage",
    component: <Search size={16} className="text-indigo-500" />,
  },

  // Performance & Access
  {
    id: "cdn",
    label: "CDN",
    icon: "Globe",
    category: "Performance & Access",
    component: <Globe size={16} className="text-cyan-500" />,
  },
  {
    id: "auth-service",
    label: "Authentication Service",
    icon: "Shield",
    category: "Performance & Access",
    component: <Shield size={16} className="text-emerald-600" />,
  },

  // Monitoring & Infra
  {
    id: "monitoring",
    label: "Monitoring Node",
    icon: "Monitor",
    category: "Monitoring & Infra",
    component: <Monitor size={16} className="text-slate-600" />,
  },
  {
    id: "network-link",
    label: "Network Link",
    icon: "Link",
    category: "Monitoring & Infra",
    component: <Link size={16} className="text-gray-400" />,
  },

  // Additional common services
  {
    id: "user-service",
    label: "User Service",
    icon: "Users",
    category: "Routing & Compute",
    component: <Users size={16} className="text-violet-500" />,
  },
  {
    id: "payment-service",
    label: "Payment Service",
    icon: "CreditCard",
    category: "Routing & Compute",
    component: <CreditCard size={16} className="text-pink-500" />,
  },
];
