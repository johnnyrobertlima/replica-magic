
import { useState, useMemo, useCallback } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { EXCLUDED_GROUPS } from "./constants";

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
  // Adding the missing properties
  giroEstoqueGrupo: number;
  percentualVendidoGrupo: number;
  diasCoberturaGrupo: number;
}

export const useStockGrouping = (items: StockItem[]) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Group items by GRU_DESCRICAO
  const groupedData = useMemo<GroupedStockData[]>(() => {
    // First, group items by GRU_DESCRICAO
    const groupedMap = new Map<string, StockItem[]>();
    
    // Filter out excluded groups
    const filteredItems = items.filter(item => 
      !EXCLUDED_GROUPS.includes(item.GRU_DESCRICAO || '')
    );
    
    filteredItems.forEach(item => {
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
        
        // Calculate derived metrics for the group
        const giroEstoqueGrupo = totalFisico > 0 
          ? totalVendido / totalFisico 
          : 0;
          
        const percentualVendidoGrupo = totalFisico > 0 
          ? (totalVendido / (totalFisico + totalVendido)) * 100 
          : 0;
          
        const diasCoberturaGrupo = (totalVendido > 0 && totalFisico > 0) 
          ? (totalFisico / (totalVendido / 30)) // Assuming 30 days per month
          : totalFisico > 0 ? 999 : 0; // If no sales but has stock: 999 days; if no stock: 0 days
        
        return {
          groupName,
          items: groupItems,
          isExpanded: expandedGroups.has(groupName),
          totalItems: groupItems.length,
          totalFisico,
          totalDisponivel,
          totalReservado,
          totalVendido,
          totalValorVendido,
          giroEstoqueGrupo,
          percentualVendidoGrupo,
          diasCoberturaGrupo
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
