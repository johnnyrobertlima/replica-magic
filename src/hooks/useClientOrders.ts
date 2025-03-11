import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrdersState } from "./useOrdersState";
import { useClientesFinanceiros } from "./useClientesFinanceiros";

export const useClientOrders = () => {
  const {
    orders,
    isLoading: isLoadingOrders,
    error,
    date,
    searchQuery,
    searchType,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    toggleItemSelection,
    clearSelection,
    isSending,
    setIsSending,
    currentPage,
    itemsPerPage,
    handleSearch,
    filteredOrders,
    filteredGroups,
    expandedClients,
    toggleExpand,
    exportSelectedItemsToExcel,
    sendToSeparacao
  } = useOrdersState();
  
  const { clientesFinanceiros, isLoading: isLoadingFinanceiros } = useClientesFinanceiros();
  
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
    orders,
    isLoading,
    error,
    date,
    searchQuery,
    searchType,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    toggleItemSelection,
    clearSelection,
    isSending,
    setIsSending,
    currentPage,
    itemsPerPage,
    handleSearch,
    filteredOrders,
    filteredGroups,
    expandedClients,
    toggleExpand,
    exportSelectedItemsToExcel,
    sendToSeparacao
  };
};
