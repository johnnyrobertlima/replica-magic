
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
    
    // Create color scale with more muted/pastel colors
    const colorRange = [
      "#D3E4FD", // Soft Blue
      "#E5DEFF", // Soft Purple
      "#FFDEE2", // Soft Pink
      "#FDE1D3", // Soft Peach
      "#FEC6A1", // Soft Orange
      "#FEF7CD", // Soft Yellow
      "#F2FCE2", // Soft Green
      "#F1F0FB", // Soft Gray
      "#D4E6F1", // Light Blue
      "#D5F5E3", // Light Green
      "#FAE5D3"  // Light Orange
    ];
    
    // Create color scale based on index
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map((_, i) => i.toString()))
      .range(colorRange);
    
    // Create cells for each leaf node
    const cell = svg.selectAll("g")
      .data(hierarchy.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${(d as any).x0},${(d as any).y0})`)
      .attr("class", "treemap-cell")
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
      .style("fill-opacity", 0.85)
      .on("mouseover", function(event, d) {
        // Highlight rectangle and show tooltip on hover
        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 2)
          .style("fill-opacity", 1);
          
        // Show custom tooltip
        const item = (d as any).data;
        const tooltip = d3.select("#d3-tooltip");
        tooltip.style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
          
        tooltip.select(".item-name").text(item.name);
        tooltip.select(".item-value").text(formatCurrency(item.value));
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
          .style("fill-opacity", 0.85);
          
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
      .attr("fill", "#333") // Darker text for better contrast on pastel backgrounds
      .attr("pointer-events", "none")
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
      .attr("fill", "#555") // Darker text for better contrast
      .attr("pointer-events", "none")
      .text(d => {
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
          
          {/* Custom tooltip */}
          <div 
            id="d3-tooltip" 
            className="absolute hidden bg-white/95 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-gray-200 z-50 pointer-events-none max-w-xs"
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
