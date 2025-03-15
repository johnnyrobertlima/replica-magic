
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
    
    // Limpar o SVG antes de desenhar
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = svgRef.current.clientWidth;
    const height = 300;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Preparar os dados para D3 treemap
    const root = d3.hierarchy({ children: data })
      .sum(d => (d as any).value)
      .sort((a, b) => b.value! - a.value!);
    
    // Criar o layout do treemap
    const treemapLayout = d3.treemap<TreemapDataItem>()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(8)
      .round(true);
    
    treemapLayout(root as d3.HierarchyNode<TreemapDataItem>);
    
    // Definir escala de cores baseada no valor
    const colorScale = d3.scaleLinear<string>()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range(["#8da0cb", "#4f46e5"]);
      
    // Função para calcular o tamanho do texto
    const calcTextSize = (d: d3.HierarchyRectangularNode<TreemapDataItem>) => {
      const area = (d.x1 - d.x0) * (d.y1 - d.y0);
      const size = Math.sqrt(area) / 10;
      return Math.min(Math.max(size, 8), 14); // limite entre 8px e 14px
    };
    
    // Criar os retângulos do treemap
    const cell = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    // Adicionar retângulos
    cell.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.value))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        // Destacar retângulo ao passar o mouse
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
          
        // Mostrar tooltip
        const tooltip = d3.select("#d3-tooltip");
        tooltip.style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px");
          
        tooltip.select(".item-name").text(d.data.name);
        tooltip.select(".item-value").text(formatCurrency(d.data.value));
      })
      .on("mouseout", function() {
        // Restaurar estilo do retângulo
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
          
        // Esconder tooltip
        d3.select("#d3-tooltip").style("display", "none");
      });
    
    // Adicionar texto (apenas para retângulos grandes o suficiente)
    cell.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", d => `${calcTextSize(d)}px`)
      .attr("fill", "white")
      .text(d => {
        const width = d.x1 - d.x0;
        const name = d.data.name;
        // Só mostrar texto se o retângulo for largo o suficiente
        return width > 40 ? name : null;
      })
      .attr("text-anchor", "start")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)")
      .each(function(d) {
        // Truncar texto se for muito longo para o retângulo
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
      
    // Opcionalmente, adicionar o valor para os retângulos muito grandes
    cell.filter(d => (d.x1 - d.x0) > 90 && (d.y1 - d.y0) > 40)
      .append("text")
      .attr("x", 4)
      .attr("y", 30)
      .attr("font-size", "10px")
      .attr("fill", "rgba(255,255,255,0.8)")
      .text(d => formatCurrency(d.data.value))
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)");
  }, [data]);

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 border">
      <h3 className="text-lg font-semibold mb-4">Volume por Item</h3>
      <div className="relative w-full h-[300px]">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Tooltip customizado */}
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
