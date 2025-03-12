
import { useMemo, useEffect, useState } from "react";
import { useAllJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { groupOrdersByClient } from "@/utils/client-orders/groupingUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { fetchClientFinancialInfo } from "@/services/jab-orders/clientFinancialService";
import { ClientOrderGroup } from "@/types/clientOrders";
import { JabOrder } from "@/types/jabOrders";

export const useClientOrders = () => {
  // Use the state hook
  const {
    state,
    setState,
    date,
    searchDate,
    expandedClients,
    searchQuery,
    searchType,
    isSearching,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    isSending,
    setDate,
    setSearchQuery,
    setSearchType,
    setShowZeroBalance,
    setShowOnlyWithStock,
    toggleExpand,
    handleSearch
  } = useClientOrdersState();

  // Data fetching hooks
  const { data: ordersData, isLoading: isLoadingOrders } = useAllJabOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  // Group orders by client
  const groupedOrders = useMemo(() => {
    if (!ordersData || !ordersData.orders || ordersData.orders.length === 0) {
      console.warn('No orders data available');
      return {};
    }

    return groupOrdersByClient(ordersData);
  }, [ordersData]);

  // State to store grouped orders with financial information
  const [groupedOrdersWithFinancialInfo, setGroupedOrdersWithFinancialInfo] = useState<Record<string, ClientOrderGroup>>({});
  const [isLoadingFinancialInfo, setIsLoadingFinancialInfo] = useState(false);
  
  // Fetch financial information when grouped orders change
  useEffect(() => {
    const getFinancialInfo = async () => {
      if (!groupedOrders || Object.keys(groupedOrders).length === 0) return;
      
      setIsLoadingFinancialInfo(true);
      try {
        const ordersWithFinancialInfo = await fetchClientFinancialInfo(groupedOrders);
        setGroupedOrdersWithFinancialInfo(ordersWithFinancialInfo);
      } catch (error) {
        console.error("Erro ao buscar informações financeiras:", error);
      } finally {
        setIsLoadingFinancialInfo(false);
      }
    };
    
    getFinancialInfo();
  }, [groupedOrders]);

  // Filter groups by search criteria
  const filteredGroups = useMemo(() => {
    const groups = { ...groupedOrdersWithFinancialInfo };
    
    if (isSearching && searchQuery && searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      
      return Object.entries(groups).reduce((filtered, [clientName, group]) => {
        let match = false;
        
        switch (searchType) {
          case 'cliente':
            match = clientName.toLowerCase().includes(normalizedQuery);
            break;
          case 'representante':
            match = (group.representante || '').toLowerCase().includes(normalizedQuery);
            break;
          case 'pedido':
            match = group.pedidos.some(pedido => 
              pedido.PED_NUMPEDIDO.includes(normalizedQuery));
            break;
          default:
            match = false;
        }
        
        if (match) {
          filtered[clientName] = group;
        }
        
        return filtered;
      }, {});
    }
    
    return groups;
  }, [groupedOrdersWithFinancialInfo, isSearching, searchQuery, searchType]);

  // Use the item selection hook
  const {
    totalSelecionado,
    handleItemSelect,
    exportSelectedItemsToExcel
  } = useItemSelection(state, setState, filteredGroups);

  // Use the separation operations hook
  const {
    handleEnviarParaSeparacao
  } = useSeparationOperations(state, setState, groupedOrders);

  return {
    // State
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
    expandedClients,
    isSending,
    // Data
    ordersData,
    totals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    // Loading states
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes || isLoadingFinancialInfo,
    // Methods
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
    exportSelectedItemsToExcel,
  };
};
