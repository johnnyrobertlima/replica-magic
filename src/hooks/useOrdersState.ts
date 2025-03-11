
import { useState, useCallback, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";

const ITEMS_PER_PAGE = 15;

export const useOrdersState = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("pedido");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);
  const [showZeroBalance, setShowZeroBalance] = useState(true);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  
  // Placeholder for grouping data by client
  const [filteredGroups, setFilteredGroups] = useState<Record<string, any>>({});

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders, error } = useJabOrders({
    dateRange: searchDate,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const handleItemSelect = useCallback((itemCode: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemCode)) {
        return prev.filter(code => code !== itemCode);
      }
      return [...prev, itemCode];
    });
  }, []);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  }, [date]);

  const toggleExpand = useCallback((clientName: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientName)) {
        newSet.delete(clientName);
      } else {
        newSet.add(clientName);
      }
      return newSet;
    });
  }, []);

  const removeLeadingZeros = useCallback((str: string) => {
    return str.replace(/^0+/, '');
  }, []);

  const exportSelectedItemsToExcel = useCallback(() => {
    console.log("Exporting selected items to Excel");
    // Implementation would go here
  }, [selectedItems]);

  const sendToSeparacao = useCallback(() => {
    console.log("Sending to separação");
    // Implementation would go here
  }, [selectedItems]);

  const handleEnviarParaSeparacao = useCallback(() => {
    console.log("Handling enviar para separação");
    // Implementation would go here
  }, [selectedItems]);

  const filteredOrders = ordersData.orders.filter((order) => {
    if (!["1", "2"].includes(order.STATUS)) {
      return false;
    }

    if (!isSearching) return true;
    
    if (searchQuery) {
      const normalizedSearchQuery = searchQuery.toLowerCase().trim();
      
      switch (searchType) {
        case "pedido":
          const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
          const normalizedSearchNumber = removeLeadingZeros(searchQuery);
          return normalizedOrderNumber.includes(normalizedSearchNumber);
        
        case "cliente":
          return order.APELIDO?.toLowerCase().includes(normalizedSearchQuery) || false;
        
        case "representante":
          return order.REPRESENTANTE_NOME?.toLowerCase().includes(normalizedSearchQuery) || false;
        
        default:
          return false;
      }
    }
    
    return true;
  });

  // Process orders and group them by client
  useEffect(() => {
    const groups: Record<string, any> = {};
    
    filteredOrders.forEach(order => {
      const clientName = order.APELIDO || 'Unknown Client';
      
      if (!groups[clientName]) {
        groups[clientName] = {
          clienteCodigo: order.PES_CODIGO,
          representante: order.REPRESENTANTE_NOME,
          totalQuantidadeSaldo: 0,
          totalValorSaldo: 0,
          totalValorPedido: 0,
          totalValorFaturado: 0,
          totalValorFaturarComEstoque: 0,
          allItems: [],
          clienteFinanceiro: null
        };
      }
      
      order.items.forEach((item: any) => {
        const qtdeSaldo = item.QTDE_SALDO || 0;
        const valorUnitario = item.VALOR_UNITARIO || 0;
        const valorTotal = qtdeSaldo * valorUnitario;
        const temEstoque = (item.FISICO || 0) > 0;
        
        groups[clientName].totalQuantidadeSaldo += qtdeSaldo;
        groups[clientName].totalValorSaldo += valorTotal;
        groups[clientName].totalValorPedido += (item.QTDE_SOLICITADA || 0) * valorUnitario;
        groups[clientName].totalValorFaturado += (item.QTDE_ENTREGUE || 0) * valorUnitario;
        
        if (temEstoque) {
          groups[clientName].totalValorFaturarComEstoque += valorTotal;
        }
        
        groups[clientName].allItems.push({
          ...item,
          pedido: order.PED_NUMPEDIDO,
          clientName
        });
      });
    });
    
    setFilteredGroups(groups);
  }, [filteredOrders]);

  const selectedItemsTotals = filteredOrders.reduce((acc, order) => {
    const selectedOrderItems = order.items.filter(item => selectedItems.includes(item.ITEM_CODIGO));
    
    selectedOrderItems.forEach(item => {
      acc.totalSaldo += item.QTDE_SALDO;
      acc.totalValor += item.QTDE_SALDO * item.VALOR_UNITARIO;
      if ((item.FISICO || 0) > 0) {
        acc.totalComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
      }
    });
    
    return acc;
  }, { totalSaldo: 0, totalValor: 0, totalComEstoque: 0 });

  const totalPages = Math.ceil(ordersData.totalCount / ITEMS_PER_PAGE);

  return {
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
    selectedItemsTotals,
    isLoading: isLoadingOrders || isLoadingTotals,
    totalPages,
    handleItemSelect,
    handleSearch,
    toggleExpand,
    expandedClients,
    filteredGroups,
    exportSelectedItemsToExcel,
    sendToSeparacao,
    handleEnviarParaSeparacao,
    error
  };
};
