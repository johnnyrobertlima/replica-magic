
import * as d3 from "d3";
import { HierarchyNode, TreemapDataItem } from "../treemapTypes";
import { formatCurrency } from "@/lib/utils";
import { getTreemapColorScale } from "../treemapColors";

/**
 * Creates a D3 hierarchy from the provided data
 */
export const createHierarchy = (
  data: TreemapDataItem[], 
  currentNode: HierarchyNode | null
): d3.HierarchyNode<any> => {
  if (currentNode) {
    return currentNode as d3.HierarchyNode<any>;
  }
  
  return d3.hierarchy({ children: data })
    .sum((d: any) => d.value ? Number(d.value) : 0);
};

/**
 * Renders a treemap with D3
 */
export const renderTreemap = (
  svgRef: React.RefObject<SVGSVGElement>,
  dataToRender: TreemapDataItem[],
  zoomState: { currentNode: HierarchyNode | null, previousNodes: HierarchyNode[] },
  onZoomToNode: (node: HierarchyNode) => void,
  onZoomReset: () => void
) => {
  if (!dataToRender.length || !svgRef.current) {
    console.log("No data or SVG ref for treemap");
    return;
  }
  
  // Clear the SVG before drawing
  d3.select(svgRef.current).selectAll("*").remove();
  
  const width = svgRef.current.clientWidth;
  const height = 300;
  
  const svg = d3.select(svgRef.current)
    .attr("width", width)
    .attr("height", height);
  
  // Create hierarchy for the current view
  const rootHierarchy = createHierarchy(dataToRender, zoomState.currentNode);
  
  // Create treemap layout
  const treemapLayout = d3.treemap<any>()
    .size([width, height])
    .paddingInner(3)
    .paddingOuter(8)
    .round(true);
  
  // Apply the treemap layout to the hierarchy
  treemapLayout(rootHierarchy);
  
  // Create color scale based on index
  const colorScale = getTreemapColorScale(d3, dataToRender);
  
  // Render breadcrumb if zoomed in
  renderBreadcrumb(svg, zoomState, onZoomReset);
  
  // Create cells for each leaf node
  renderTreemapCells(svg, rootHierarchy, colorScale, onZoomToNode);
};

/**
 * Renders the breadcrumb navigation for zoomed states
 */
const renderBreadcrumb = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  zoomState: { currentNode: HierarchyNode | null, previousNodes: HierarchyNode[] },
  onZoomReset: () => void
) => {
  if (zoomState.previousNodes.length > 0) {
    const breadcrumb = svg.append("g")
      .attr("class", "breadcrumb")
      .attr("transform", "translate(10, 20)");
    
    breadcrumb.append("text")
      .attr("class", "breadcrumb-text")
      .attr("fill", "#666")
      .style("font-size", "12px")
      .style("cursor", "pointer")
      .text("Todos")
      .on("click", () => onZoomReset());
    
    // Add breadcrumb trail
    zoomState.previousNodes.forEach((node, i) => {
      breadcrumb.append("text")
        .attr("class", "breadcrumb-text")
        .attr("fill", "#666")
        .style("font-size", "12px")
        .style("cursor", "pointer")
        .attr("transform", `translate(${60 + i * 100}, 0)`)
        .text(() => {
          const name = node.data?.name || "Categoria";
          return ` > ${name.length > 15 ? name.substring(0, 15) + '...' : name}`;
        })
        .on("click", () => {
          // Handle zoom navigation in the breadcrumb
          onZoomReset();
          // We can't easily reconstruct the zoom state here, so we'll just reset
        });
    });
  }
};

/**
 * Renders individual treemap cells with animations
 */
const renderTreemapCells = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  rootHierarchy: d3.HierarchyNode<any>,
  colorScale: d3.ScaleOrdinal<string, string>,
  onZoomToNode: (node: HierarchyNode) => void
) => {
  // Create cells for each leaf node
  const cell = svg.selectAll(".treemap-cell")
    .data(rootHierarchy.leaves())
    .enter()
    .append("g")
    .attr("class", "treemap-cell")
    .attr("transform", d => `translate(${(d as any).x0},${(d as any).y0})`)
    .attr("data-item", d => {
      const item = d.data as TreemapDataItem;
      return item.name;
    })
    .attr("data-value", d => {
      const item = d.data as TreemapDataItem;
      return formatCurrency(item.value);
    });
  
  // Add rectangles with staggered animation
  cell.append("rect")
    .attr("id", (d, i) => `rect-${i}`)
    .attr("width", d => Math.max(0, (d as any).x1 - (d as any).x0))
    .attr("height", 0) // Start with height 0 for animation
    .attr("fill", (d, i) => colorScale(i.toString()))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .attr("class", "cursor-pointer")
    .style("fill-opacity", 0.85)
    .transition() // Add transition for initial load
    .duration(500)
    .delay((d, i) => i * 20) // Stagger the animations
    .attr("height", d => Math.max(0, (d as any).y1 - (d as any).y0))
    .on("end", function(this: SVGRectElement, d: any) {
      attachCellEventHandlers(this, d, onZoomToNode);
    });
  
  addCellLabels(cell);
};

/**
 * Adds event handlers to treemap cells
 */
const attachCellEventHandlers = (
  rectElement: SVGRectElement, 
  d: any, 
  onZoomToNode: (node: HierarchyNode) => void
) => {
  d3.select(rectElement)
    .on("mouseover", function(event, d) {
      // Highlight rectangle and show tooltip on hover
      d3.select(this)
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .style("fill-opacity", 1)
        .transition()
        .duration(150)
        .attr("transform", "scale(1.02)");
        
      // Show custom tooltip with fade-in
      const item = (d as HierarchyNode).data;
      const tooltip = d3.select("#d3-tooltip");
      tooltip
        .style("display", "block")
        .style("opacity", 0)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px")
        .transition()
        .duration(200)
        .style("opacity", 1);
        
      tooltip.select(".item-name").text(item.name || "");
      tooltip.select(".item-value").text(formatCurrency(item.value || 0));
    })
    .on("mousemove", function(event) {
      // Move tooltip with cursor
      d3.select("#d3-tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      // Restore rectangle style and hide tooltip
      d3.select(this)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .style("fill-opacity", 0.85)
        .transition()
        .duration(150)
        .attr("transform", "scale(1)");
        
      d3.select("#d3-tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() {
          d3.select(this).style("display", "none");
        });
    })
    .on("click", function(event, d) {
      // Handle zoom in on click
      const node = d as HierarchyNode;
      if (node.children) {
        // If this node has children, zoom into it
        onZoomToNode(node);
      } else if (node.parent && node.parent.children && node.parent.children.length > 1) {
        // If this is a leaf node but has siblings, zoom to parent
        onZoomToNode(node.parent);
      }
    });
};

/**
 * Adds text labels to treemap cells
 */
const addCellLabels = (cell: d3.Selection<SVGGElement, unknown, null, undefined>) => {
  // Add text labels with fade-in animation
  cell.append("text")
    .attr("x", 4)
    .attr("y", 14)
    .attr("font-size", d => {
      const rect = d as any;
      const area = (rect.x1 - rect.x0) * (rect.y1 - rect.y0);
      const size = Math.sqrt(area) / 10;
      return `${Math.min(Math.max(size, 8), 14)}px`;
    })
    .attr("fill", "#333") // Darker text for better contrast on pastel backgrounds
    .attr("pointer-events", "none")
    .style("opacity", 0) // Start with opacity 0 for animation
    .text(d => {
      const rect = d as any;
      const width = rect.x1 - rect.x0;
      const item = d.data as TreemapDataItem;
      return width > 60 ? item.name : null;
    })
    .each(function(d) {
      // Truncate text if too long for rectangle
      const node = this as SVGTextElement;
      const rect = d as any;
      const rectWidth = rect.x1 - rect.x0 - 8;
      
      let textLength = node.getComputedTextLength();
      let text = node.textContent || "";
      
      while (textLength > rectWidth && text.length > 0) {
        text = text.slice(0, -1);
        node.textContent = text + "...";
        textLength = node.getComputedTextLength();
      }
    })
    .transition() // Add fade-in transition
    .duration(400)
    .delay((d, i) => 300 + i * 20) // Delay after rectangles animation
    .style("opacity", 1);
  
  // Add value text for large rectangles with fade-in animation
  cell.filter(d => {
      const rect = d as any;
      return (rect.x1 - rect.x0) > 90 && (rect.y1 - rect.y0) > 40;
    })
    .append("text")
    .attr("x", 4)
    .attr("y", 30)
    .attr("font-size", "10px")
    .attr("fill", "#555") // Darker text for better contrast
    .attr("pointer-events", "none")
    .style("opacity", 0) // Start with opacity 0 for animation
    .text(d => {
      const item = d.data as TreemapDataItem;
      return formatCurrency(item.value);
    })
    .transition() // Add fade-in transition
    .duration(400)
    .delay((d, i) => 500 + i * 20) // Delay after labels animation
    .style("opacity", 1);
};
