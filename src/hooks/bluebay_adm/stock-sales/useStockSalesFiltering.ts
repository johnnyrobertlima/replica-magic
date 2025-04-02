
import { useState, useEffect } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";

export const useStockSalesFiltering = (
  items: StockItem[],
  searchTerm: string,
  groupFilter: string,
  minCadastroYear: string,
  showZeroStock: boolean
) => {
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);

  // Apply all filters when dependencies change
  useEffect(() => {
    let result = [...items];
    
    // Filter by cadastro year
    if (minCadastroYear !== "all") {
      const minYear = parseInt(minCadastroYear);
      result = result.filter(item => {
        if (!item.DATACADASTRO) return false;
        const cadastroDate = new Date(item.DATACADASTRO);
        return cadastroDate.getFullYear() >= minYear;
      });
    }
    
    // Filter by stock
    if (!showZeroStock) {
      result = result.filter(item => (item.FISICO || 0) > 0);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.ITEM_CODIGO && item.ITEM_CODIGO.toLowerCase().includes(term)) ||
        (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term))
      );
    }
    
    // Filter by group
    if (groupFilter && groupFilter !== "all") {
      result = result.filter(item => item.GRU_DESCRICAO === groupFilter);
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, groupFilter, minCadastroYear, showZeroStock]);

  return { filteredItems };
};
