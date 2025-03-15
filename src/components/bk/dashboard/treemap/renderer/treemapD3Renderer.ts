import * as d3 from "d3";
import { TreemapDataItem, TreemapZoomState, HierarchyNode } from "../treemapTypes";

/**
 * Render a treemap visualization with D3
 */
export const renderTreemap = (
  svgRef: React.RefObject<SVGSVGElement>,
  data: TreemapDataItem[],
  zoomState: TreemapZoomState,
  handleZoomToNode: (node: HierarchyNode) => void,
  handleZoomReset: () => void
) => {
  if (!svgRef.current || !data.length) return;
  
  // Clear existing content
  d3.select(svgRef.current).selectAll("*").remove();
  
  const width = svgRef.current.clientWidth;
  const height = svgRef.current.clientHeight;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  
  // Define the root type that includes children
  interface TreemapRoot {
    name: string;
    children: TreemapDataItem[];
  }
  
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
  
  // Create the tooltip
  const tooltip = d3.select("#d3-tooltip");
  
  // Create cells for leaf nodes only
  const cell = g
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`)
    .attr("class", "treemap-cell")
    .style("cursor", "pointer")
    .on("click", function(event, d) {
      event.stopPropagation();
      
      // If we're already at this node level, zoom out
      if (zoomState.currentNode === d) {
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
    })
    .on("mouseover", function(event, d) {
      // For tooltip we need to access the data
      // Cast to the right type to access data properties safely
      const dataItem = d.data as unknown as TreemapDataItem;
      const value = d.value || 0;
      
      // Update tooltip content
      tooltip.select(".item-name").text(dataItem.name);
      tooltip.select(".item-value").text(formatCurrency(value));
      
      // Position and show tooltip
      tooltip
        .style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`)
        .style("opacity", 1);
      
      // Highlight this cell
      d3.select(this).select("rect").classed("highlighted", true);
    })
    .on("mousemove", function(event) {
      // Move tooltip with mouse
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", function() {
      // Hide tooltip
      tooltip
        .style("opacity", 0)
        .style("display", "none");
      
      // Remove highlight
      d3.select(this).select("rect").classed("highlighted", false);
    });
  
  // Add rectangle for each cell
  cell.append("rect")
    .attr("id", d => {
      const dataItem = d.data as unknown as TreemapDataItem;
      return `rect-${dataItem.name.replace(/\s+/g, '-')}`;
    })
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => colorScale(d.value || 0))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .classed("treemap-rect", true);
  
  // Add text to each cell that has enough space
  cell.append("text")
    .filter(d => (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 20)
    .attr("x", 4)
    .attr("y", 14)
    .attr("font-size", "10px")
    .attr("fill", "#fff")
    .text(d => {
      const dataItem = d.data as unknown as TreemapDataItem;
      return truncateText(dataItem.name, d.x1 - d.x0);
    });
  
  // Add value text to larger cells
  cell.append("text")
    .filter(d => (d.x1 - d.x0) > 80 && (d.y1 - d.y0) > 40)
    .attr("x", 4)
    .attr("y", 26)
    .attr("font-size", "9px")
    .attr("fill", "rgba(255,255,255,0.8)")
    .text(d => formatCurrency(d.value || 0));
  
  // Add click handler on background to reset zoom
  svg.on("click", function(event) {
    if (event.target === svgRef.current) {
      handleZoomReset();
    }
  });
};

/**
 * Generate a color scale for treemap cells
 */
const colorScale = (value: number): string => {
  const interpolator = d3.interpolateRgb('#8ecae6', '#023047');
  return interpolator(Math.log(value + 1) / 15);
};

/**
 * Format currency for display
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Truncate text to fit in a container
 */
const truncateText = (text: string, width: number): string => {
  if (!text) return '';
  
  const maxChars = Math.floor(width / 6);
  if (text.length <= maxChars) return text;
  
  return text.substring(0, maxChars - 3) + '...';
};
