
import * as d3 from "d3";
import { TreemapDataItem, TreemapZoomState, HierarchyNode } from "../treemapTypes";
import { TreemapRoot, TreemapRenderParams } from "./types";
import { colorScale, truncateText, formatCurrency } from "./utils";
import { setupTooltipHandlers } from "./tooltipHandler";
import { applyZoomState, setupZoomHandlers, setupBackgroundClickHandler } from "./zoomHandler";

/**
 * Render a treemap visualization with D3
 */
export const renderTreemap = ({
  svgRef,
  data,
  zoomState,
  handleZoomToNode,
  handleZoomReset
}: TreemapRenderParams) => {
  if (!svgRef.current || !data.length) return;
  
  // Clear existing content
  d3.select(svgRef.current).selectAll("*").remove();
  
  const width = svgRef.current.clientWidth;
  const height = svgRef.current.clientHeight;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  
  // Setup the hierarchy data structure
  const hierarchy = d3.hierarchy<TreemapRoot>({ name: "root", children: data })
    .sum((d) => {
      // If it's a child node (TreemapDataItem), use its value
      if ('value' in d) {
        return d.value as number;
      }
      // Otherwise it's the root, return 0
      return 0;
    })
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Create treemap layout
  const treemap = d3.treemap<TreemapRoot>()
    .size([
      width - margin.left - margin.right,
      height - margin.top - margin.bottom
    ])
    .paddingOuter(2)
    .paddingInner(1)
    .round(true);
  
  // Apply the treemap layout to the hierarchy
  const root = treemap(hierarchy);
  
  // Create the SVG group for the treemap
  const svg = d3.select(svgRef.current);
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Apply zoom state if a node is selected
  applyZoomState(g, zoomState, width, height, margin);
  
  // Create the tooltip
  const tooltip = d3.select("#d3-tooltip");
  
  // Create cells for leaf nodes only
  // Important: Cast the selection type properly to fix type errors
  const cells = g
    .selectAll<SVGGElement, d3.HierarchyRectangularNode<TreemapRoot>>("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`)
    .attr("class", "treemap-cell")
    .style("cursor", "pointer");
  
  // Use the properly typed cells for the handlers
  setupZoomHandlers(cells, zoomState, handleZoomToNode, handleZoomReset);
  
  // Setup tooltip handlers with the properly typed cells
  setupTooltipHandlers(cells, tooltip, svgRef);
  
  // Add rectangle for each cell
  cells.append("rect")
    .attr("id", d => {
      const dataItem = d.data as unknown as { name: string };
      return `rect-${dataItem.name.replace(/\s+/g, '-')}`;
    })
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => colorScale(d.value || 0))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .classed("treemap-rect", true);
  
  // Add text to each cell that has enough space
  cells.append("text")
    .filter(d => (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 20)
    .attr("x", 4)
    .attr("y", 14)
    .attr("font-size", "10px")
    .attr("fill", "#fff")
    .text(d => {
      const dataItem = d.data as unknown as { name: string };
      return truncateText(dataItem.name, d.x1 - d.x0);
    });
  
  // Add value text to larger cells
  cells.append("text")
    .filter(d => (d.x1 - d.x0) > 80 && (d.y1 - d.y0) > 40)
    .attr("x", 4)
    .attr("y", 26)
    .attr("font-size", "9px")
    .attr("fill", "rgba(255,255,255,0.8)")
    .text(d => formatCurrency(d.value || 0));
  
  // Setup background click handler for zoom reset
  setupBackgroundClickHandler(svg, svgRef, handleZoomReset);
};
