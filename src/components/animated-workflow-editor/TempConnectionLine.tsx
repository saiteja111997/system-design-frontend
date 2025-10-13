import React from "react";
import { TempLine } from "@/types/workflow";

interface TempConnectionLineProps {
  tempLine: TempLine;
}

export const TempConnectionLine: React.FC<TempConnectionLineProps> = ({
  tempLine,
}) => {
  return (
    <g>
      <path
        d={`M${tempLine.x1},${tempLine.y1} Q${
          (tempLine.x1 + tempLine.x2) / 2
        },${(tempLine.y1 + tempLine.y2) / 2 + 30} ${tempLine.x2},${
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
