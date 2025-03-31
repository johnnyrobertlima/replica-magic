
import { useEffect } from "react";
import { useAnaliseDeCompraFetching } from "./useAnaliseDeCompraFetching";
import { useAnaliseDeCompraFiltering } from "./useAnaliseDeCompraFiltering";

export const useAnaliseDeCompraData = () => {
  const { estoqueItems, isLoading, fetchEstoqueData } = useAnaliseDeCompraFetching();
  const { 
    filteredItems, 
    groupedItems, 
    searchTerm, 
    setSearchTerm,
    filterAndGroupItems 
  } = useAnaliseDeCompraFiltering(estoqueItems);

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
