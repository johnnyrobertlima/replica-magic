
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { formatCurrency } from "@/lib/utils";

interface TreemapDataItem {
  name: string;
  value: number;
}

interface ItemTreemapProps {
  data: TreemapDataItem[];
}

export const ItemTreemap = ({ data }: ItemTreemapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    
    // Clear the SVG before drawing
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 300;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Prepare data for D3 treemap
    const root = d3.hierarchy({ children: data })
      .sum((d: any) => {
        // Handle leaf nodes (our actual data items)
        if (d.value !== undefined) {
          return Number(d.value);
        }
        return 0;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    
    // Create treemap layout
    const treemapLayout = d3.treemap<unknown>()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(8)
      .round(true);
    
    // Apply the treemap layout
    treemapLayout(root as d3.HierarchyRectangularNode<unknown>);
    
    // Create color scale based on value
    const maxValue = d3.max(data, d => d.value) || 0;
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxValue])
      .range(["#8da0cb", "#4f46e5"]);
    
    // Function to calculate text size based on rectangle area
    const calcTextSize = (node: d3.HierarchyRectangularNode<unknown>) => {
      const area = (node.x1 - node.x0) * (node.y1 - node.y0);
      const size = Math.sqrt(area) / 10;
      return Math.min(Math.max(size, 8), 14); // limit between 8px and 14px
    };
    
    // Create treemap cells (only for leaf nodes)
    const cell = svg.selectAll("g")
      .data(root.leaves() as d3.HierarchyRectangularNode<unknown>[])
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    // Add rectangles
    cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => {
        // Get the original data item
        const item = d.data as unknown as TreemapDataItem;
        return colorScale(item.value);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        // Highlight rectangle on hover
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
        
        // Get data for tooltip
        const item = d.data as unknown as TreemapDataItem;
        
        // Show tooltip
        const tooltip = d3.select("#d3-tooltip");
        tooltip.style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px");
        
        tooltip.select(".item-name").text(item.name);
        tooltip.select(".item-value").text(formatCurrency(item.value));
      })
      .on("mouseout", function() {
        // Restore rectangle style
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
        
        // Hide tooltip
        d3.select("#d3-tooltip").style("display", "none");
      });
    
    // Add text (only for rectangles large enough)
    cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", d => `${calcTextSize(d as d3.HierarchyRectangularNode<unknown>)}px`)
      .attr("fill", "white")
      .text(d => {
        const width = d.x1 - d.x0;
        const item = d.data as unknown as TreemapDataItem;
        // Only show text if rectangle is wide enough
        return width > 40 ? item.name : null;
      })
      .attr("text-anchor", "start")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)")
      .each(function(d) {
        // Truncate text if too long for the rectangle
        const node = this as SVGTextElement;
        const rectWidth = d.x1 - d.x0 - 8;
        
        let textLength = node.getComputedTextLength();
        let text = node.textContent || "";
        
        while (textLength > rectWidth && text.length > 0) {
          text = text.slice(0, -1);
          node.textContent = text + "...";
          textLength = node.getComputedTextLength();
        }
      });
    
    // Optionally, add value for very large rectangles
    cell.filter(d => (d.x1 - d.x0) > 90 && (d.y1 - d.y0) > 40)
      .append("text")
      .attr("x", 4)
      .attr("y", 30)
      .attr("font-size", "10px")
      .attr("fill", "rgba(255,255,255,0.8)")
      .text(d => {
        const item = d.data as unknown as TreemapDataItem;
        return formatCurrency(item.value);
      })
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)");
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 border">
      <h3 className="text-lg font-semibold mb-4">Volume por Item</h3>
      <div className="relative w-full h-[300px]">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Custom tooltip */}
        <div 
          id="d3-tooltip" 
          className="absolute hidden bg-white p-2 shadow-lg rounded border z-10 pointer-events-none"
          style={{ display: 'none' }}
        >
          <p className="item-name font-medium"></p>
          <p className="item-value text-sm text-muted-foreground"></p>
        </div>
      </div>
    </div>
  );
};
