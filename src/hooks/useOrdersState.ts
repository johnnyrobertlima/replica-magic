
import { useState, useCallback } from "react";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import { PedidoUnicoResult } from "@/types/jabOrders";

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

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders } = useJabOrders({
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

  const removeLeadingZeros = useCallback((str: string) => {
    return str.replace(/^0+/, '');
  }, []);

  // Since the API returns only ped_numpedido and total_count, we need to use an empty array
  // for filtered orders until we get more data
  const filteredOrders = [];

  const selectedItemsTotals = { totalSaldo: 0, totalValor: 0, totalComEstoque: 0 };

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
    handleSearch
  };
};
