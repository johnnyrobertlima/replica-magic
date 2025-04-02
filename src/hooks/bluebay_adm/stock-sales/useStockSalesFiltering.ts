
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

  // Apply filters only when user explicitly sets them
  useEffect(() => {
    let result = [...items];
    
    // Apply search filter if the user has entered a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.ITEM_CODIGO && item.ITEM_CODIGO.toLowerCase().includes(term)) ||
        (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term))
      );
    }
    
    // Apply group filter only if a specific group is selected
    if (groupFilter && groupFilter !== "all") {
      result = result.filter(item => item.GRU_DESCRICAO === groupFilter);
    }
    
    // Apply cadastro year filter only if a specific year is selected
    if (minCadastroYear !== "all") {
      const minYear = parseInt(minCadastroYear);
      result = result.filter(item => {
        if (!item.DATACADASTRO) return true; // Show items with no date
        const cadastroDate = new Date(item.DATACADASTRO);
        return cadastroDate.getFullYear() >= minYear;
      });
    }
    
    // Apply stock filter only if user wants to hide zero stock items
    if (!showZeroStock) {
      result = result.filter(item => (item.FISICO || 0) > 0);
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, groupFilter, minCadastroYear, showZeroStock]);

  return { filteredItems };
};
