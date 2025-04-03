
import { useMemo, useState } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";

export interface GroupedStockData {
  groupName: string;
  items: StockItem[];
  totalItems: number;
  totalFisico: number;
  totalDisponivel: number;
  totalReservado: number;
  isExpanded: boolean;
}

export const useStockGrouping = (items: StockItem[]) => {
  // State to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group items by GRU_DESCRICAO
  const groupedData = useMemo(() => {
    // Initial grouping
    const groups: Record<string, StockItem[]> = {};
    
    items.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    
    // Convert to array format with totals
    const groupedArray: GroupedStockData[] = Object.entries(groups).map(([groupName, groupItems]) => ({
      groupName,
      items: groupItems,
      totalItems: groupItems.length,
      totalFisico: groupItems.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0),
      totalDisponivel: groupItems.reduce((sum, item) => sum + (Number(item.DISPONIVEL) || 0), 0),
      totalReservado: groupItems.reduce((sum, item) => sum + (Number(item.RESERVADO) || 0), 0),
      isExpanded: expandedGroups.has(groupName)
    }));
    
    // Sort by group name alphabetically
    groupedArray.sort((a, b) => a.groupName.localeCompare(b.groupName));
    
    return groupedArray;
  }, [items, expandedGroups]);

  // Toggle expansion state of a group
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Expand all groups
  const expandAllGroups = () => {
    const allGroupNames = groupedData.map(group => group.groupName);
    setExpandedGroups(new Set(allGroupNames));
  };

  // Collapse all groups
  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  return {
    groupedData,
    toggleGroup,
    expandAllGroups,
    collapseAllGroups,
    expandedGroups
  };
};
