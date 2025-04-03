
import { useState, useMemo, useCallback } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";

export interface GroupedStockData {
  groupName: string;
  items: StockItem[];
  isExpanded: boolean;
  totalItems: number;
  totalFisico: number;
  totalDisponivel: number;
  totalReservado: number;
  totalVendido: number;
  totalValorVendido: number;
}

export const useStockGrouping = (items: StockItem[]) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Group items by GRU_DESCRICAO
  const groupedData = useMemo<GroupedStockData[]>(() => {
    // First, group items by GRU_DESCRICAO
    const groupedMap = new Map<string, StockItem[]>();
    
    items.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!groupedMap.has(groupName)) {
        groupedMap.set(groupName, []);
      }
      groupedMap.get(groupName)!.push(item);
    });
    
    // Convert map to array of group data objects
    return Array.from(groupedMap.entries())
      .map(([groupName, groupItems]) => {
        // Calculate totals for this group
        const totalFisico = groupItems.reduce((sum, item) => sum + (item.FISICO || 0), 0);
        const totalDisponivel = groupItems.reduce((sum, item) => sum + (item.DISPONIVEL || 0), 0);
        const totalReservado = groupItems.reduce((sum, item) => sum + (item.RESERVADO || 0), 0);
        const totalVendido = groupItems.reduce((sum, item) => sum + (item.QTD_VENDIDA || 0), 0);
        const totalValorVendido = groupItems.reduce((sum, item) => sum + (item.VALOR_TOTAL_VENDIDO || 0), 0);
        
        return {
          groupName,
          items: groupItems,
          isExpanded: expandedGroups.has(groupName),
          totalItems: groupItems.length,
          totalFisico,
          totalDisponivel,
          totalReservado,
          totalVendido,
          totalValorVendido
        };
      })
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [items, expandedGroups]);
  
  // Toggle group expansion
  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(groupName)) {
        newExpanded.delete(groupName);
      } else {
        newExpanded.add(groupName);
      }
      return newExpanded;
    });
  }, []);
  
  // Expand all groups
  const expandAllGroups = useCallback(() => {
    const allGroups = new Set(groupedData.map(group => group.groupName));
    setExpandedGroups(allGroups);
  }, [groupedData]);
  
  // Collapse all groups
  const collapseAllGroups = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);
  
  return {
    groupedData,
    toggleGroup,
    expandAllGroups,
    collapseAllGroups
  };
};
