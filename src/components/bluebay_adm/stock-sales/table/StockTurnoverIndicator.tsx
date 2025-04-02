
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatTableNumber } from "../utils/formatters";

interface StockTurnoverIndicatorProps {
  turnover: number | null;
}

export const StockTurnoverIndicator: React.FC<StockTurnoverIndicatorProps> = ({ turnover }) => {
  if (turnover === null || turnover === undefined) return <span>-</span>;
  
  return (
    <div className="flex items-center">
      {formatTableNumber(turnover)}
      {turnover > 1 ? (
        <TrendingUp className="ml-1 h-4 w-4 text-green-600" />
      ) : turnover > 0 ? (
        <TrendingDown className="ml-1 h-4 w-4 text-amber-600" />
      ) : null}
    </div>
  );
};
