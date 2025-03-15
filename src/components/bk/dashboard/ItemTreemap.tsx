
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { formatCurrency } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    treemapLayout(hierarchy);
    
    // Create enhanced color scale with more colors
    const colorRange = [
      "#3B82F6", // blue-500
      "#8B5CF6", // violet-500
      "#EC4899", // pink-500
      "#EF4444", // red-500
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#06B6D4", // cyan-500
      "#6366F1", // indigo-500
      "#8B5CF6", // violet-500
      "#D946EF", // fuchsia-500
      "#F97316"  // orange-500
    ];
    
    // Create color scale based on index instead of value for more variety
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map((_, i) => i.toString()))
      .range(colorRange);
    
    // Create cells for each leaf node
    const cell = svg.selectAll("g")
      .data(hierarchy.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${(d as any).x0},${(d as any).y0})`)
      .attr("data-item", d => {
        const item = d.data as any;
        return item.name;
      })
      .attr("data-value", d => {
        const item = d.data as any;
        return formatCurrency(item.value);
      });
    
    // Add rectangles
    cell.append("rect")
      .attr("id", (d, i) => `rect-${i}`)
      .attr("width", d => Math.max(0, (d as any).x1 - (d as any).x0))
      .attr("height", d => Math.max(0, (d as any).y1 - (d as any).y0))
      .attr("fill", (d, i) => colorScale(i.toString()))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("class", "cursor-pointer transition-all duration-200")
      .on("mouseover", function() {
        // Highlight rectangle on hover
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2)
          .attr("filter", "brightness(1.1)");
      })
      .on("mouseout", function() {
        // Restore rectangle style
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("filter", null);
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
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)")
      .text(d => {
        const rect = d as any;
        const width = rect.x1 - rect.x0;
        const item = d.data as any;
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
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)")
      .text(d => {
        const item = d.data as any;
        return formatCurrency(item.value);
      });
      
    // Create tooltip triggers by adding transparent overlay 
    // that works with the Radix UI Tooltip component
    cell.append("rect")
      .attr("width", d => Math.max(0, (d as any).x1 - (d as any).x0))
      .attr("height", d => Math.max(0, (d as any).y1 - (d as any).y0))
      .attr("fill", "transparent")
      .attr("class", "tooltip-trigger cursor-pointer")
      .attr("data-item", d => {
        const item = d.data as any;
        return item.name;
      })
      .attr("data-value", d => {
        const item = d.data as any;
        return formatCurrency(item.value);
      });
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 border">
      <h3 className="text-lg font-semibold mb-4">Volume por Item</h3>
      <TooltipProvider delayDuration={0}>
        <div className="relative w-full h-[300px]">
          <svg ref={svgRef} className="w-full h-full"></svg>
          {data.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div id={`tooltip-trigger-${index}`} className="absolute top-0 left-0 w-0 h-0 opacity-0"></div>
              </TooltipTrigger>
              <TooltipContent className="bg-white/95 backdrop-blur shadow-lg border border-gray-200 p-3 rounded-lg">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{formatCurrency(item.value)}</div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Custom D3 tooltip fallback */}
          <div 
            id="d3-tooltip" 
            className="absolute hidden bg-white/95 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200 z-10 pointer-events-none max-w-xs"
            style={{ display: 'none' }}
          >
            <p className="item-name font-medium"></p>
            <p className="item-value text-sm text-muted-foreground mt-1"></p>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
