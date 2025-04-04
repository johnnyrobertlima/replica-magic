
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

interface StockTurnoverIndicatorProps {
  turnover: number;
}

export const StockTurnoverIndicator: React.FC<StockTurnoverIndicatorProps> = ({ turnover }) => {
  // Default to medium if no value
  if (turnover === null || turnover === undefined) {
    return (
      <div className="flex items-center justify-end gap-1 text-gray-500">
        <span>-</span>
      </div>
    );
  }

  // Determine turnover level
  const isLow = turnover < 1;
  const isHigh = turnover > 3;
  
  return (
    <div className="flex items-center justify-end gap-1">
      <span>{turnover.toFixed(2)}</span>
      {isLow && (
        <ArrowDownIcon 
          className="h-4 w-4 text-red-500" 
          title="Giro baixo" 
        />
      )}
      {!isLow && !isHigh && (
        <ArrowRightIcon
          className="h-4 w-4 text-amber-500"
          title="Giro médio"
        />
      )}
      {isHigh && (
        <ArrowUpIcon
          className="h-4 w-4 text-green-500"
          title="Giro alto"
        />
      )}
    </div>
  );
};
