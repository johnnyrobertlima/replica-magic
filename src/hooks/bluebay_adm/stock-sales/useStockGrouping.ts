
import { useState, useEffect } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";

export interface GroupedStockData {
  groupName: string;
  items: StockItem[];
  isExpanded: boolean;
  totalItems: number;
  totalFisico: number;
  totalDisponivel: number;
  totalReservado: number;
  totalEntrou: number;
  totalVendido: number;
  totalValorVendido: number;
  totalCusto: number;
  totalLucro: number;
  giroEstoqueGrupo: number;
  percentualVendidoGrupo: number;
  diasCoberturaGrupo: number;
}

export const useStockGrouping = (items: StockItem[]) => {
  const [groupedData, setGroupedData] = useState<GroupedStockData[]>([]);

  // Process items and group them by GRU_DESCRICAO
  useEffect(() => {
    processGroups();
  }, [items]);

  // Process and group items
  const processGroups = () => {
    // Group items by GRU_DESCRICAO
    const groupedItems = items.reduce((acc, item) => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      
      acc[groupName].push(item);
      return acc;
    }, {} as Record<string, StockItem[]>);

    // Convert grouped items to array format with calculations
    const groupsArray = Object.entries(groupedItems).map(([groupName, items]) => {
      // Calculate group totals
      const totalFisico = items.reduce((sum, item) => sum + (item.FISICO || 0), 0);
      const totalDisponivel = items.reduce((sum, item) => sum + (item.DISPONIVEL || 0), 0);
      const totalReservado = items.reduce((sum, item) => sum + (item.RESERVADO || 0), 0);
      const totalEntrou = items.reduce((sum, item) => sum + (item.ENTROU || 0), 0);
      const totalVendido = items.reduce((sum, item) => sum + (item.QTD_VENDIDA || 0), 0);
      const totalValorVendido = items.reduce((sum, item) => sum + (item.VALOR_TOTAL_VENDIDO || 0), 0);
      const totalCusto = items.reduce((sum, item) => sum + (item.CUSTO_MEDIO || 0), 0);
      const totalLucro = items.reduce((sum, item) => sum + (item.LUCRO || 0), 0);
      
      // Group indicators
      const giroEstoqueGrupo = totalFisico > 0 ? totalVendido / totalFisico : 0;
      const percentualVendidoGrupo = (totalVendido + totalFisico) > 0 
        ? (totalVendido / (totalVendido + totalFisico)) * 100 
        : 0;
        
      // Calculate average daily sales for the group
      const diasCoberturaGrupo = totalVendido > 0 
        ? totalFisico / (totalVendido / 90) // Assuming 90 days period
        : totalFisico > 0 ? 999 : 0;
      
      return {
        groupName,
        items: items.sort((a, b) => {
          // Ensure we have valid strings before comparing item codes
          const codeA = a.ITEM_CODIGO || '';
          const codeB = b.ITEM_CODIGO || '';
          return codeA.localeCompare(codeB);
        }),
        isExpanded: false, // Start collapsed
        totalItems: items.length,
        totalFisico,
        totalDisponivel,
        totalReservado,
        totalEntrou,
        totalVendido,
        totalValorVendido,
        totalCusto,
        totalLucro,
        giroEstoqueGrupo,
        percentualVendidoGrupo,
        diasCoberturaGrupo
      };
    });

    // Sort groups by name - Add safe comparison to handle undefined values
    groupsArray.sort((a, b) => {
      // Ensure we have valid strings before comparing
      const groupNameA = a.groupName || '';
      const groupNameB = b.groupName || '';
      return groupNameA.localeCompare(groupNameB);
    });
    
    setGroupedData(groupsArray);
  };

  // Toggle the expansion state of a group
  const toggleGroup = (groupName: string) => {
    setGroupedData(prevData => 
      prevData.map(group => 
        group.groupName === groupName 
          ? { ...group, isExpanded: !group.isExpanded } 
          : group
      )
    );
  };

  // Expand all groups
  const expandAllGroups = () => {
    setGroupedData(prevData => 
      prevData.map(group => ({ ...group, isExpanded: true }))
    );
  };

  // Collapse all groups
  const collapseAllGroups = () => {
    setGroupedData(prevData => 
      prevData.map(group => ({ ...group, isExpanded: false }))
    );
  };

  return {
    groupedData,
    toggleGroup,
    expandAllGroups,
    collapseAllGroups
  };
};
