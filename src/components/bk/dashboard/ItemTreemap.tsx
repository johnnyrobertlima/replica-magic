
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { TreemapDataItem } from "./treemap/treemapTypes";
import { useTreemapRenderer } from "./treemap/useTreemapRenderer";
import { TreemapControls } from "./treemap/TreemapControls";

interface ItemTreemapProps {
  data: TreemapDataItem[];
}

export const ItemTreemap = ({ data }: ItemTreemapProps) => {
  // We're maintaining the same API, so the component doesn't need to change
  const { 
    svgRef, 
    handleValueRangeChange, 
    handleZoomReset, 
    handleZoomIn, 
    handleZoomOut,
    minValue,
    maxValue,
    isFiltered,
    isZoomed
  } = useTreemapRenderer(data);

  return (
    <div className="w-full bg-white rounded-lg p-4 border animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Volume por Item</h3>
      
      {/* Controls section */}
      {data.length > 0 && (
        <TreemapControls
          minValue={minValue}
          maxValue={maxValue}
          onValueRangeChange={handleValueRangeChange}
          onZoomReset={handleZoomReset}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          isZoomed={isZoomed}
        />
      )}
      
      {/* Status indicators */}
      {(isFiltered || isZoomed) && (
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2 mt-3">
          {isFiltered && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Filtrado</span>}
          {isZoomed && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ampliado</span>}
        </div>
      )}
      
      {/* Treemap visualization */}
      <div className="relative w-full h-[400px] mt-4">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Custom tooltip */}
        <div 
          id="d3-tooltip" 
          className="absolute hidden bg-white/95 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200 z-50 pointer-events-none max-w-xs transition-opacity duration-200 opacity-0"
          style={{ display: 'none', minWidth: '180px' }}
        >
          <p className="item-name font-medium text-sm"></p>
          <p className="item-value text-sm text-blue-700 font-semibold mt-1"></p>
        </div>
      </div>
    </div>
  );
};
