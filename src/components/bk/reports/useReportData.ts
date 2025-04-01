
import { useMemo, useState } from "react";
import { ItemReport } from "@/services/bluebay/types";

interface GroupedItems {
  [groupName: string]: ItemReport[];
}

export const useReportData = (items: ItemReport[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("ITEM_CODIGO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return (
        item.ITEM_CODIGO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.DESCRICAO?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.GRU_DESCRICAO?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [items, searchTerm]);

  // Sort filtered items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortField === "TOTAL_VALOR") {
        const valueA = a.TOTAL_VALOR || 0;
        const valueB = b.TOTAL_VALOR || 0;
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      
      if (sortField === "TOTAL_QUANTIDADE") {
        const valueA = a.TOTAL_QUANTIDADE || 0;
        const valueB = b.TOTAL_QUANTIDADE || 0;
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      
      if (sortField === "OCORRENCIAS") {
        const valueA = a.OCORRENCIAS || 0;
        const valueB = b.OCORRENCIAS || 0;
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      
      // Default string comparison
      const valueA = String(a[sortField] || "");
      const valueB = String(b[sortField] || "");
      return sortDirection === "asc" 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    });
  }, [filteredItems, sortField, sortDirection]);

  // Group items by GRU_DESCRICAO
  const groupedItems = useMemo(() => {
    const groups: GroupedItems = {};
    
    sortedItems.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    
    return groups;
  }, [sortedItems]);

  // Calculate group totals
  const groupTotals = useMemo(() => {
    const totals: Record<string, { quantidade: number; valor: number; ocorrencias: number }> = {};
    
    Object.entries(groupedItems).forEach(([groupName, items]) => {
      totals[groupName] = items.reduce((acc, item) => {
        return {
          quantidade: acc.quantidade + item.TOTAL_QUANTIDADE,
          valor: acc.valor + item.TOTAL_VALOR,
          ocorrencias: acc.ocorrencias + item.OCORRENCIAS
        };
      }, { quantidade: 0, valor: 0, ocorrencias: 0 });
    });
    
    return totals;
  }, [groupedItems]);

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    groupedItems,
    groupTotals,
    expandedGroups,
    toggleGroup,
    sortedItems
  };
};
