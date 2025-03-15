
import * as d3 from "d3";
import { TreemapRoot } from "./types";
import { TreemapZoomState, HierarchyNode } from "../treemapTypes";

/**
 * Apply zoom transformation to the treemap
 */
export const applyZoomState = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  zoomState: TreemapZoomState,
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number }
) => {
  if (zoomState.currentNode) {
    const node = zoomState.currentNode;
    const x0 = node.x0;
    const y0 = node.y0;
    const x1 = node.x1;
    const y1 = node.y1;
    const kx = (width - margin.left - margin.right) / (x1 - x0);
    const ky = (height - margin.top - margin.bottom) / (y1 - y0);
    const k = Math.min(kx, ky);
    
    g.attr("transform", `translate(${margin.left - x0 * k},${margin.top - y0 * k}) scale(${k})`);
  }
};

/**
 * Add click handlers for zoom functionality
 */
export const setupZoomHandlers = (
  cell: d3.Selection<SVGGElement, d3.HierarchyRectangularNode<TreemapRoot>, SVGGElement, unknown>,
  zoomState: TreemapZoomState,
  handleZoomToNode: (node: HierarchyNode) => void,
  handleZoomReset: () => void
) => {
  cell.on("click", function(event, d) {
    event.stopPropagation();
    
    // If we're already at this node level, zoom out
    if (zoomState.currentNode === (d as unknown as HierarchyNode)) {
      if (zoomState.previousNodes.length > 0) {
        // If we have a previous node, zoom to it
        const previousNode = zoomState.previousNodes[zoomState.previousNodes.length - 1];
        handleZoomToNode(previousNode);
      } else {
        // Reset to root view
        handleZoomReset();
      }
    } else {
      // Zoom to this node - we need to cast this properly
      // First cast to unknown, then to HierarchyNode to avoid type mismatch
      const hierarchyNode = d as unknown as HierarchyNode;
      handleZoomToNode(hierarchyNode);
    }
  });
};

/**
 * Set up background click handler to reset zoom
 */
export const setupBackgroundClickHandler = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  svgRef: React.RefObject<SVGSVGElement>,
  handleZoomReset: () => void
) => {
  svg.on("click", function(event) {
    if (event.target === svgRef.current) {
      handleZoomReset();
    }
  });
};
