
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
  cell.on("mouseover", function(event, d) {
    // Get the data item from the node
    const dataItem = d.data.children ? { name: d.data.name, value: 0 } : d.data as unknown as { name: string; value: number };
    const value = d.value || 0;
    
    // Update tooltip content
    tooltip.select(".item-name").text(dataItem.name);
    tooltip.select(".item-value").text(formatCurrency(value));
    
    // Position tooltip near the mouse pointer with some offset
    tooltip
      .style("display", "block")
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 40}px`)
      .style("opacity", 1);
    
    // Highlight this cell
    d3.select(this).select("rect").classed("highlighted", true);
  })
  .on("mousemove", function(event) {
    // Update position as mouse moves
    tooltip
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 40}px`);
  })
  .on("mouseout", function() {
    // Hide tooltip
    tooltip
      .style("opacity", 0)
      .style("display", "none");
    
    // Remove highlight
    d3.select(this).select("rect").classed("highlighted", false);
  });
};
