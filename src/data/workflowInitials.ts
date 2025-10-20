import { Node, Edge } from "@/types/workflow-editor/workflow";
import { nodeOptions } from "@/data/nodeTypeOptions";

// Helper function to create a node from nodeOptions with position
const createNodeFromOption = (
  nodeOptionId: string,
  id: number,
  label: string,
  x: number,
  y: number,
  type: "start" | "process" | "end" = "process"
): Node => {
  const nodeOption = nodeOptions.find((option) => option.id === nodeOptionId);
  if (!nodeOption) {
    throw new Error(`Node option ${nodeOptionId} not found in nodeOptions`);
  }

  // Get default configurations
  const defaultConfigurations: Record<string, string | number | boolean> = {};
  if (nodeOption.configurations) {
    Object.values(nodeOption.configurations).forEach((field) => {
      defaultConfigurations[field.key] = field.defaultValue;
    });
  }

  return {
    id,
    label,
    x,
    y,
    type,
    icon: nodeOption.icon,
    configurations: defaultConfigurations,
  };
};

// Initial nodes displayed on the workflow canvas
export const initialNodes: Node[] = [
  // Client
  createNodeFromOption("client-app", 1, "Client", 130, 290, "start"),
  // API Gateway
  createNodeFromOption("api-gateway", 2, "Gateway", 260, 290),
  // Services Layer - aligned vertically around the baseline with increased spacing
  createNodeFromOption("sync-compute", 3, "User Service", 390, 110), // 180px above baseline (was 140)
  createNodeFromOption("sync-compute", 4, "Order Service", 390, 290), // On baseline - unchanged
  createNodeFromOption("sync-compute", 5, "Payment", 390, 470), // 180px below baseline (was 440)
  // Load Balancers - aligned vertically with increased spacing
  createNodeFromOption("load-balancer", 6, "User LB", 520, 110),
  createNodeFromOption("load-balancer", 7, "Order LB", 520, 290), // On baseline - unchanged
  createNodeFromOption("load-balancer", 8, "Pay LB", 520, 470),
  // User Service Servers - aligned vertically above baseline with 30px gaps
  createNodeFromOption("sync-compute", 9, "User S1", 650, 50), // 240px above baseline (was 80)
  createNodeFromOption("sync-compute", 10, "User S2", 650, 110), // 210px above baseline (was 110)
  createNodeFromOption("sync-compute", 11, "User S3", 650, 170), // 180px above baseline (was 140)
  // Order Service Servers - aligned around Order LB with 30px gaps
  createNodeFromOption("sync-compute", 12, "Order S1", 650, 230), // 30px above Order LB (y=290)
  createNodeFromOption("sync-compute", 13, "Order S2", 650, 290), // Aligned with Order LB (y=290)
  createNodeFromOption("sync-compute", 14, "Order S3", 650, 350), // 30px below Order LB (y=290)
  // Payment Service Servers - aligned around Pay LB with 30px gaps
  createNodeFromOption("sync-compute", 15, "Pay S1", 650, 410), // 30px above Pay LB (y=470)
  createNodeFromOption("sync-compute", 16, "Pay S2", 650, 470), // Aligned with Pay LB (y=470)
  createNodeFromOption("sync-compute", 17, "Pay S3", 650, 530), // 30px below Pay LB (y=470)
  // Databases - aligned vertically with increased spacing
  createNodeFromOption("database", 18, "User DB", 770, 110),
  createNodeFromOption("database", 19, "Order DB", 770, 290), // On baseline - unchanged
  createNodeFromOption("database", 20, "Pay DB", 770, 470),
];

// Initial edges connecting the nodes
export const initialEdges: Edge[] = [
  // Client to Gateway
  { id: "e1", source: 1, target: 2 },
  // Gateway to Services
  { id: "e2", source: 2, target: 3 },
  { id: "e3", source: 2, target: 4 },
  { id: "e4", source: 2, target: 5 },
  // Services to Load Balancers
  { id: "e5", source: 3, target: 6 },
  { id: "e6", source: 4, target: 7 },
  { id: "e7", source: 5, target: 8 },
  // Load Balancers to Servers
  { id: "e8", source: 6, target: 9 },
  { id: "e9", source: 6, target: 10 },
  { id: "e10", source: 6, target: 11 },
  { id: "e11", source: 7, target: 12 },
  { id: "e12", source: 7, target: 13 },
  { id: "e13", source: 7, target: 14 },
  { id: "e14", source: 8, target: 15 },
  { id: "e15", source: 8, target: 16 },
  { id: "e16", source: 8, target: 17 },
  // Servers to Databases
  { id: "e17", source: 9, target: 18 },
  { id: "e18", source: 10, target: 18 },
  { id: "e19", source: 11, target: 18 },
  { id: "e20", source: 12, target: 19 },
  { id: "e21", source: 13, target: 19 },
  { id: "e22", source: 14, target: 19 },
  { id: "e23", source: 15, target: 20 },
  { id: "e24", source: 16, target: 20 },
  { id: "e25", source: 17, target: 20 },
];
