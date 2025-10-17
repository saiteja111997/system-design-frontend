/**
 * Direct exports for Zustand store - use these directly in components
 * Following Zustand best practices to avoid getServerSnapshot warnings
 */

// Re-export the store for direct use in components
export { useWorkflowStore } from "@/stores/workflowStore";
