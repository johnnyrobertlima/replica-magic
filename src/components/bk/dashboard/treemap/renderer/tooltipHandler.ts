
import * as d3 from "d3";
import { TreemapRoot } from "./types";
import { formatCurrency } from "./utils";

/**
 * Set up tooltip interactions for treemap cells
 */
export const setupTooltipHandlers = (
  cell: d3.Selection<d3.BaseType, d3.HierarchyRectangularNode<TreemapRoot>, d3.BaseType, unknown>,
  tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  svgRef: React.RefObject<SVGSVGElement>
) => {
  cell.on("mouseover", function(event, d) {
    // Get the data item from the node
    const dataItem = d.data.children ? { name: d.data.name, value: 0 } : d.data.children ? 
      { name: d.data.name, value: 0 } : d.data as unknown as { name: string; value: number };
    const value = d.value || 0;
    
    // Update tooltip content
    tooltip.select(".item-name").text(dataItem.name);
    tooltip.select(".item-value").text(formatCurrency(value));
    
    // Position tooltip in the top-right corner
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      // Fixed positioning in the top-right corner with margin
      const tooltipWidth = 200; // Approximate tooltip width
      const rightPosition = svgRect.right - tooltipWidth - 10; // 10px margin from right edge
      const topPosition = svgRect.top + 10; // 10px margin from top
      
      tooltip
        .style("display", "block")
        .style("left", `${rightPosition}px`)
        .style("top", `${topPosition}px`)
        .style("opacity", 1);
    }
    
    // Highlight this cell
    d3.select(this).select("rect").classed("highlighted", true);
  })
  .on("mousemove", function() {
    // No position change on mouse move
    // Tooltip remains fixed in the top-right corner
  })
  .on("mouseout", function() {
    // Hide tooltip
    tooltip
      .style("opacity", 0)
      .style("display", "none");
    
    // Remove highlight
    d3.select(this).select("rect").classed("highlighted", false);
  });
  
  return cell;
};
