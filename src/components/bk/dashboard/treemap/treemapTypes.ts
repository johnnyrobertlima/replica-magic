
/**
 * Type definitions for the treemap components
 */

export interface TreemapDataItem {
  name: string;
  value: number;
}

export interface ItemTreemapProps {
  data: TreemapDataItem[];
}

export interface TooltipDataProps {
  name: string;
  value: string;
}

export interface TreemapCellProps {
  data: any;
  index: number;
  colorScale: any;
  width: number;
  height: number;
  animate?: boolean;
  animationDelay?: number;
}

export interface TreemapZoomState {
  currentNode: HierarchyNode | null;
  previousNodes: HierarchyNode[];
}

export interface TreemapFilterState {
  valueRange: [number, number];
  originalData: TreemapDataItem[];
  filteredData: TreemapDataItem[];
}

/**
 * TypeScript interface for D3 hierarchy node structure
 * This helps solve type errors when working with d3.hierarchy objects
 */
export interface HierarchyNode {
  data: {
    name?: string;
    value?: number;
    children?: any[];
    [key: string]: any;
  };
  depth: number;
  height: number;
  parent: HierarchyNode | null;
  children?: HierarchyNode[];
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  value?: number;
  id?: string;
  [key: string]: any;
}
