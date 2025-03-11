import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrdersState } from "./useOrdersState";
import { useClientesFinanceiros } from "./useClientesFinanceiros";

export const useClientOrders = () => {
  const {
    date,
    setDate,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    showZeroBalance,
    setShowZeroBalance,
    showOnlyWithStock,
    setShowOnlyWithStock,
    selectedItems,
    ordersData,
    totals,
    filteredOrders,
    selectedItemsTotals: totalSelecionado,
    isLoading: isLoadingOrders,
    handleItemSelect,
    handleSearch,
    handleEnviarParaSeparacao,
    toggleExpand,
    exportSelectedItemsToExcel,
    sendToSeparacao,
    expandedClients,
    filteredGroups,
    error
  } = useOrdersState();

  const { clientesFinanceiros, isLoading: isLoadingFinanceiros } = useClientesFinanceiros();
  const [isSending, setIsSending] = useState(false);
  
  const processClienteFinanceiro = useCallback(() => {
    if (clientesFinanceiros.length > 0) {
      const clienteFinanceiroMap = new Map();
      clientesFinanceiros.forEach(cliente => {
        clienteFinanceiroMap.set(cliente.PES_CODIGO, cliente);
      });
      
      const updatedGroups = { ...filteredGroups };
      
      Object.keys(updatedGroups).forEach(clientName => {
        const group = updatedGroups[clientName];
        if (group.clienteCodigo) {
          const financeiro = clienteFinanceiroMap.get(group.clienteCodigo);
          if (financeiro) {
            group.clienteFinanceiro = financeiro;
          }
        }
      });
      
      
    }
  }, [clientesFinanceiros, filteredGroups]);
  
  useEffect(() => {
    processClienteFinanceiro();
  }, [clientesFinanceiros, processClienteFinanceiro]);
  
  const isLoading = isLoadingOrders || isLoadingFinanceiros;

  return {
    orders: ordersData?.orders || [],
    isLoading,
    error,
    date,
    setDate,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    showZeroBalance,
    setShowZeroBalance,
    showOnlyWithStock,
    setShowOnlyWithStock,
    selectedItems,
    toggleItemSelection: handleItemSelect,
    isSending,
    setIsSending,
    currentPage,
    itemsPerPage: 15,
    handleSearch,
    filteredOrders,
    filteredGroups,
    expandedClients,
    toggleExpand,
    exportSelectedItemsToExcel,
    sendToSeparacao,
    totals,
    totalSelecionado,
    handleEnviarParaSeparacao,
    separacoes: []
  };
};
