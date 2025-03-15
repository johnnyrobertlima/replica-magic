
import { useState, useEffect, useCallback } from "react";
import { TreemapDataItem, TreemapZoomState, TreemapFilterState, HierarchyNode } from "../treemapTypes";

/**
 * Hook for managing treemap state (zoom and filtering)
 */
export const useTreemapState = (data: TreemapDataItem[]) => {
  // Zoom state management
  const [zoomState, setZoomState] = useState<TreemapZoomState>({
    currentNode: null,
    previousNodes: []
  });
  
  // Filter state management
  const [filterState, setFilterState] = useState<TreemapFilterState>({
    valueRange: [0, 0],
    originalData: [],
    filteredData: []
  });
  
  // Initialize filter state when data changes
  useEffect(() => {
    if (data.length) {
      const minValue = Math.min(...data.map(item => item.value));
      const maxValue = Math.max(...data.map(item => item.value));
      
      setFilterState({
        valueRange: [minValue, maxValue],
        originalData: data,
        filteredData: data
      });
    }
  }, [data]);
  
  // Handle filtering data by value range
  const handleValueRangeChange = useCallback((range: [number, number]) => {
    const filtered = filterState.originalData.filter(
      item => item.value >= range[0] && item.value <= range[1]
    );
    
    setFilterState(prev => ({
      ...prev,
      valueRange: range,
      filteredData: filtered
    }));
  }, [filterState.originalData]);
  
  // Reset zoom to initial state
  const handleZoomReset = useCallback(() => {
    setZoomState({
      currentNode: null,
      previousNodes: []
    });
  }, []);
  
  // Zoom in to a node
  const handleZoomToNode = useCallback((node: HierarchyNode) => {
    setZoomState(prev => ({
      currentNode: node,
      previousNodes: prev.currentNode ? [...prev.previousNodes, prev.currentNode] : []
    }));
  }, []);
  
  // Zoom out to previous level
  const handleZoomOut = useCallback(() => {
    if (zoomState.previousNodes.length > 0) {
      const previousNodes = [...zoomState.previousNodes];
      const lastNode = previousNodes.pop() || null;
      
      setZoomState({
        currentNode: lastNode,
        previousNodes
      });
    } else {
      handleZoomReset();
    }
  }, [zoomState, handleZoomReset]);

  return {
    zoomState,
    filterState,
    handleValueRangeChange,
    handleZoomReset,
    handleZoomToNode,
    handleZoomOut,
    minValue: filterState.valueRange[0],
    maxValue: filterState.valueRange[1],
    isFiltered: filterState.filteredData.length !== filterState.originalData.length,
    isZoomed: zoomState.currentNode !== null || zoomState.previousNodes.length > 0
  };
};
