
import { useState, useMemo } from "react";
import { useAllJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useQueryClient } from "@tanstack/react-query";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useToast } from "@/hooks/use-toast";
import { sendOrdersForSeparation } from "@/services/clientSeparationService";
import { 
  groupOrdersByClient, 
  filterGroupsBySearchCriteria,
  calculateTotalSelected
} from "@/utils/clientOrdersUtils";
import type { ClientOrdersState } from "@/types/clientOrders";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export const useClientOrders = () => {
  // Client orders state
  const [state, setState] = useState<ClientOrdersState>({
    date: {
      from: new Date(),
      to: new Date(),
    },
    searchDate: {
      from: new Date(),
      to: new Date(),
    },
    expandedClients: new Set<string>(),
    searchQuery: "",
    searchType: "pedido",
    isSearching: false,
    showZeroBalance: false,
    showOnlyWithStock: false,
    selectedItems: [],
    selectedItemsDetails: {},
    isSending: false
  });

  // Destructure state for easier access
  const {
    date,
    searchDate,
    expandedClients,
    searchQuery,
    searchType,
    isSearching,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    selectedItemsDetails,
    isSending
  } = state;

  // Hook dependencies
  const { data: ordersData = { orders: [], totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders } = useAllJabOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate the total of selected items
  const totalSelecionado = useMemo(() => calculateTotalSelected(selectedItemsDetails), [selectedItemsDetails]);

  // Group orders by client
  const groupedOrders = useMemo(() => groupOrdersByClient(ordersData), [ordersData]);

  // Filter groups by search criteria
  const filteredGroups = useMemo(() => 
    filterGroupsBySearchCriteria(groupedOrders, isSearching, searchQuery, searchType), 
    [groupedOrders, isSearching, searchQuery, searchType]
  );

  // State update methods
  const setDate = (newDate: DateRange | undefined) => {
    setState(prev => ({ ...prev, date: newDate }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const setSearchType = (type: SearchType) => {
    setState(prev => ({ ...prev, searchType: type }));
  };

  const setShowZeroBalance = (show: boolean) => {
    setState(prev => ({ ...prev, showZeroBalance: show }));
  };

  const setShowOnlyWithStock = (show: boolean) => {
    setState(prev => ({ ...prev, showOnlyWithStock: show }));
  };

  const toggleExpand = (clientName: string) => {
    setState(prev => {
      const newSet = new Set(prev.expandedClients);
      if (newSet.has(clientName)) {
        newSet.delete(clientName);
      } else {
        newSet.add(clientName);
      }
      return { ...prev, expandedClients: newSet };
    });
  };

  const handleSearch = () => {
    setState(prev => ({ 
      ...prev, 
      isSearching: true,
      searchDate: prev.date
    }));
  };

  const handleItemSelect = (item: any) => {
    const itemCode = item.ITEM_CODIGO;
    
    setState(prev => {
      const isAlreadySelected = prev.selectedItems.includes(itemCode);
      let newSelectedItems = prev.selectedItems;
      let newSelectedItemsDetails = { ...prev.selectedItemsDetails };
      
      if (isAlreadySelected) {
        // Remove item from selection
        newSelectedItems = prev.selectedItems.filter(code => code !== itemCode);
        delete newSelectedItemsDetails[itemCode];
      } else {
        // Add item to selection
        newSelectedItems = [...prev.selectedItems, itemCode];
        newSelectedItemsDetails[itemCode] = {
          qtde: item.QTDE_SALDO,
          valor: item.VALOR_UNITARIO
        };
      }
      
      return { 
        ...prev, 
        selectedItems: newSelectedItems,
        selectedItemsDetails: newSelectedItemsDetails
      };
    });
  };

  const handleEnviarParaSeparacao = async () => {
    setState(prev => ({ ...prev, isSending: true }));
    
    try {
      const result = await sendOrdersForSeparation(selectedItems, groupedOrders);
      
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['separacoes'] });
        await queryClient.invalidateQueries({ queryKey: ['jabOrders'] });
        
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedItemsDetails: {},
          expandedClients: new Set()
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

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
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes,
    // Methods
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
  };
};
