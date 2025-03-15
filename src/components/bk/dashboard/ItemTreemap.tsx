
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { TreemapDataItem } from "./treemap/treemapTypes";
import { useTreemapRenderer } from "./treemap/useTreemapRenderer";

interface ItemTreemapProps {
  data: TreemapDataItem[];
}

export const ItemTreemap = ({ data }: ItemTreemapProps) => {
  const { svgRef } = useTreemapRenderer(data);

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 border animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Volume por Item</h3>
      <div className="relative w-full h-[300px]">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Custom tooltip */}
        <div 
          id="d3-tooltip" 
          className="absolute hidden bg-white/95 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200 z-50 pointer-events-none max-w-xs transition-opacity duration-200 opacity-0"
          style={{ display: 'none' }}
        >
          <p className="item-name font-medium"></p>
          <p className="item-value text-sm text-muted-foreground mt-1"></p>
        </div>
      </div>
    </div>
  );
};
