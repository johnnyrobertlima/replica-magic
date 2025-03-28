
import { useEffect } from "react";
import { useEstoqueFetching } from "./useEstoqueFetching";
import { useEstoqueFiltering } from "./useEstoqueFiltering";

export const useEstoqueData = () => {
  const { estoqueItems, isLoading, fetchEstoqueData } = useEstoqueFetching();
  const { 
    filteredItems, 
    groupedItems, 
    searchTerm, 
    setSearchTerm,
    filterAndGroupItems 
  } = useEstoqueFiltering(estoqueItems);

  useEffect(() => {
    fetchEstoqueData();
  }, []);

  return {
    estoqueItems,
    filteredItems,
    groupedItems,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterAndGroupItems,
    fetchEstoqueData
  };
};
