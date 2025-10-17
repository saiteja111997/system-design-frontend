import {
  Sparkles,
  MousePointer,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  PenTool,
  Type,
  MessageSquare,
  Maximize,
  Undo2,
  Redo2,
} from "lucide-react";

export const canvasDockItems = [
  {
    id: "ai-diagram",
    name: "AIDiagram",
    tooltip: "AI Diagram",
    route: "",
    component: (
      <Sparkles size={14} className="text-slate-700 dark:text-white" />
    ),
  },
  {
    id: "selection-tool",
    name: "SelectionTool",
    tooltip: "Selection Tool",
    route: "",
    component: (
      <MousePointer size={14} className="text-slate-700 dark:text-white" />
    ),
  },
  {
    id: "rectangle-tool",
    name: "RectangleTool",
    tooltip: "Rectangle Tool",
    route: "",
    component: <Square size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "ellipse-tool",
    name: "EllipseTool",
    tooltip: "Ellipse Tool",
    route: "",
    component: <Circle size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "free-draw",
    name: "FreeDraw",
    tooltip: "Free Draw",
    route: "",
    component: <PenTool size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "arrow",
    name: "Arrow",
    tooltip: "Arrow",
    route: "",
    component: (
      <ArrowUpRight size={14} className="text-slate-700 dark:text-white" />
    ),
  },
  {
    id: "line",
    name: "Line",
    tooltip: "Line",
    route: "",
    component: <Minus size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "text",
    name: "Text",
    tooltip: "Text",
    route: "",
    component: <Type size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "comment",
    name: "Comment",
    tooltip: "Comment",
    route: "",
    component: (
      <MessageSquare size={14} className="text-slate-700 dark:text-white" />
    ),
  },
  {
    id: "undo",
    name: "Undo",
    tooltip: "Undo (Ctrl+Z)",
    route: "",
    component: <Undo2 size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "redo",
    name: "Redo",
    tooltip: "Redo (Ctrl+Shift+Z)",
    route: "",
    component: <Redo2 size={14} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "fullscreen",
    name: "Fullscreen",
    tooltip: "Fullscreen",
    route: "",
    component: (
      <Maximize size={14} className="text-slate-700 dark:text-white" />
    ),
  },
];
