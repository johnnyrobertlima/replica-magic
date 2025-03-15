
import { TreemapDataItem, TreemapZoomState, HierarchyNode } from "../treemapTypes";
import { RefObject } from "react";

/**
 * Root node type for D3 hierarchy
 */
export interface TreemapRoot {
  name: string;
  children: TreemapDataItem[];
}

/**
 * Common parameters for treemap rendering functions
 */
export interface TreemapRenderParams {
  svgRef: RefObject<SVGSVGElement>;
  data: TreemapDataItem[];
  zoomState: TreemapZoomState;
  handleZoomToNode: (node: HierarchyNode) => void;
  handleZoomReset: () => void;
}
