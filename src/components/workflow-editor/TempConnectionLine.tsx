import React from "react";
import { TempConnectionLineProps } from "@/types/workflow-editor/components";

export const TempConnectionLine: React.FC<TempConnectionLineProps> = ({
  tempLine,
}) => {
  return (
    <g>
      <path
        d={`M${tempLine.x1},${tempLine.y1} Q${
          (tempLine.x1 + tempLine.x2) / 2
        },${(tempLine.y1 + tempLine.y2) / 3 + 30} ${tempLine.x2},${
          tempLine.y2
        }`}
        stroke="#f97316"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5,5"
        opacity="0.7"
        strokeLinecap="round"
      />
    </g>
  );
};
