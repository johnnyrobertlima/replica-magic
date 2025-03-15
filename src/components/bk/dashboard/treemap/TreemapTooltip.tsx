
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipDataProps } from "./treemapTypes";

interface TreemapTooltipProps {
  children: React.ReactNode;
  data: TooltipDataProps;
}

export const TreemapTooltip = ({ children, data }: TreemapTooltipProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-white/95 backdrop-blur-sm border border-gray-200 p-3 shadow-lg"
        >
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{data.value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
