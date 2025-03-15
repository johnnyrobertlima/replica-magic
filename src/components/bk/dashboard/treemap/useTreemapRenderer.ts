
import { useRef, useEffect } from "react";
import { TreemapDataItem } from "./treemapTypes";
import { useTreemapState } from "./hooks/useTreemapState";
import { renderTreemap } from "./renderer/treemapD3Renderer";

/**
 * Main hook for treemap rendering and interaction.
 * This hook combines state management with D3 rendering.
 */
export const useTreemapRenderer = (data: TreemapDataItem[]) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use the extracted state management hook
  const {
    zoomState,
    filterState,
    handleValueRangeChange,
    handleZoomReset,
    handleZoomToNode,
    handleZoomOut,
    minValue,
    maxValue,
    isFiltered,
    isZoomed
  } = useTreemapState(data);
  
  // Render the treemap whenever data, filter, or zoom state changes
  useEffect(() => {
    renderTreemap({
      svgRef, 
      data: filterState.filteredData, 
      zoomState, 
      handleZoomToNode, 
      handleZoomReset
    });
  }, [filterState.filteredData, zoomState, handleZoomReset, handleZoomToNode]);
  
  // Wrap the zoom in functionality to maintain consistent API
  const handleZoomIn = () => {
    console.log('Zoom in requested, but needs a specific node to zoom to');
    // This is a placeholder for direct zoom in - 
    // actual zoom in happens when clicking cells
  };

  return { 
    svgRef,
    handleValueRangeChange,
    handleZoomReset,
    handleZoomIn,
    handleZoomOut,
    minValue,
    maxValue,
    isFiltered,
    isZoomed
  };
};
