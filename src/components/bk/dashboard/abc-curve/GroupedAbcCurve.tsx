
import React, { useMemo } from "react";
import { AbcCurveChart } from "./AbcCurveChart";

interface GroupedAbcCurveProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

export const GroupedAbcCurve = ({ data, isLoading }: GroupedAbcCurveProps) => {
  // Process data to group by GRU_DESCRICAO
  const groupedData = useMemo(() => {
    if (!data.length) return [];
    
    // Extract group info from item names (which include the group in parentheses)
    const groupTotals = new Map<string, number>();
    
    data.forEach(item => {
      // Check if the item name contains group info in parentheses
      const match = item.name.match(/\(([^)]+)\)/);
      const group = match ? match[1] : 'Sem Grupo';
      
      const currentTotal = groupTotals.get(group) || 0;
      groupTotals.set(group, currentTotal + item.value);
    });
    
    // Convert to array format needed by the chart
    return Array.from(groupTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [data]);

  return (
    <AbcCurveChart 
      data={groupedData}
      title="Curva ABC por Grupo de Itens" 
      description="Distribuição de faturamento por grupo de itens"
      isLoading={isLoading}
    />
  );
};
