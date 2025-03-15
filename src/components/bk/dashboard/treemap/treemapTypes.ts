
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
