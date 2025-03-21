
import * as d3 from "d3";
import { TreemapRoot } from "./types";
import { formatCurrency } from "./utils";

/**
 * Set up tooltip interactions for treemap cells
 */
export const setupTooltipHandlers = (
  cell: d3.Selection<SVGGElement, d3.HierarchyRectangularNode<TreemapRoot>, SVGGElement, unknown>,
  tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  svgRef: React.RefObject<SVGSVGElement>
) => {
  // Create a tooltip instance using shadcn/ui's tooltip component
  const createTooltip = () => {
    // Remove any existing tooltips first
    d3.selectAll(".treemap-tooltip").remove();
    
    // Create the tooltip container
    return d3.select("body")
      .append("div")
      .attr("class", "treemap-tooltip")
      .style("position", "absolute")
      .style("z-index", "100")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid rgba(0,0,0,0.1)")
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("font-family", "inherit")
      .style("font-size", "14px")
      .style("max-width", "220px");
  };
  
  // Create tooltip element
  const tooltipElement = createTooltip();

  cell.on("mouseover", function(event, d) {
    // Get the data item from the node
    const dataItem = d.data.children ? { name: d.data.name, value: 0 } : d.data as unknown as { name: string; value: number };
    const value = d.value || 0;
    
    // Update tooltip content
    tooltipElement.html(`
      <div>
        <p class="font-medium">${dataItem.name}</p>
        <p class="text-sm text-blue-700 font-semibold">${formatCurrency(value)}</p>
      </div>
    `);
    
    // Show tooltip near mouse
    tooltipElement
      .style("visibility", "visible")
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 40}px`);
    
    // Highlight this cell
    d3.select(this).select("rect").classed("highlighted", true);
  })
  .on("mousemove", function(event) {
    // Update position as mouse moves
    tooltipElement
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 40}px`);
  })
  .on("mouseout", function() {
    // Hide tooltip
    tooltipElement.style("visibility", "hidden");
    
    // Remove highlight
    d3.select(this).select("rect").classed("highlighted", false);
  });
};
