
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
    if (!data.length || !svgRef.current) {
      console.log("No data or SVG ref for treemap");
      return;
    }
    
    console.log("Rendering treemap with data:", data);
    
    // Clear the SVG before drawing
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 300;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Create hierarchy from data
    const hierarchy = d3.hierarchy({ children: data })
      .sum((d: any) => {
        // Ensure we return a number for the value
        return d.value ? Number(d.value) : 0;
      });
    
    // Create treemap layout
    const treemapLayout = d3.treemap()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(8)
      .round(true);
    
    // Apply the treemap layout to the hierarchy
    treemapLayout(hierarchy as any);
    
    // Create color scale based on value
    const maxValue = d3.max(data, d => d.value) || 0;
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxValue])
      .range(["#8da0cb", "#4f46e5"]);
    
    // Create cells for each leaf node
    const cell = svg.selectAll("g")
      .data(hierarchy.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${(d as any).x0},${(d as any).y0})`);
    
    // Add rectangles
    cell.append("rect")
      .attr("width", d => (d as any).x1 - (d as any).x0)
      .attr("height", d => (d as any).y1 - (d as any).y0)
      .attr("fill", d => {
        const item = d.data as any;
        return colorScale(item.value);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        // Highlight rectangle on hover
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
        
        // Show tooltip
        const tooltip = d3.select("#d3-tooltip");
        tooltip.style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px");
        
        const item = d.data as any;
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
    
    // Add text labels
    cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", d => {
        const rect = d as any;
        const area = (rect.x1 - rect.x0) * (rect.y1 - rect.y0);
        const size = Math.sqrt(area) / 10;
        return `${Math.min(Math.max(size, 8), 14)}px`;
      })
      .attr("fill", "white")
      .text(d => {
        const rect = d as any;
        const width = rect.x1 - rect.x0;
        const item = d.data as any;
        return width > 60 ? item.name : null;
      })
      .attr("text-anchor", "start")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)")
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
      });
    
    // Add value text for large rectangles
    cell.filter(d => {
        const rect = d as any;
        return (rect.x1 - rect.x0) > 90 && (rect.y1 - rect.y0) > 40;
      })
      .append("text")
      .attr("x", 4)
      .attr("y", 30)
      .attr("font-size", "10px")
      .attr("fill", "rgba(255,255,255,0.8)")
      .text(d => {
        const item = d.data as any;
        return formatCurrency(item.value);
      })
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)");
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 border">
      <h3 className="text-lg font-semibold mb-4">Volume por Cliente</h3>
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
