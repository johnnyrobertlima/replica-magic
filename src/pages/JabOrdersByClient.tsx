
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import OrderCard from "@/components/jab-orders/OrderCard";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ITEMS_PER_PAGE = 15;

const JabOrdersByClient = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("pedido");
  const [isSearching, setIsSearching] = useState(false);
  const [showZeroBalanceMap, setShowZeroBalanceMap] = useState<Record<string, boolean>>({});

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders } = useJabOrders({
    dateRange: searchDate,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const toggleShowZeroBalance = (orderId: string) => {
    setShowZeroBalanceMap(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  };

  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  };

  // Agrupa os pedidos por cliente
  const groupedOrders = useMemo(() => {
    const groups: Record<string, typeof ordersData.orders> = {};
    
    ordersData.orders.forEach((order) => {
      if (!["1", "2"].includes(order.STATUS)) return;
      
      const clientKey = order.APELIDO || "Sem Cliente";
      if (!groups[clientKey]) {
        groups[clientKey] = [];
      }
      groups[clientKey].push(order);
    });

    return groups;
  }, [ordersData.orders]);

  // Filtra os grupos de pedidos
  const filteredGroups = useMemo(() => {
    if (!isSearching || !searchQuery) return groupedOrders;

    const normalizedSearchQuery = searchQuery.toLowerCase().trim();
    const filteredGroups: Record<string, typeof ordersData.orders> = {};

    Object.entries(groupedOrders).forEach(([clientName, orders]) => {
      const filteredOrders = orders.filter(order => {
        switch (searchType) {
          case "pedido":
            const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
            const normalizedSearchNumber = removeLeadingZeros(searchQuery);
            return normalizedOrderNumber.includes(normalizedSearchNumber);
          
          case "cliente":
            return clientName.toLowerCase().includes(normalizedSearchQuery);
          
          case "representante":
            return order.REPRESENTANTE_NOME?.toLowerCase().includes(normalizedSearchQuery) || false;
          
          default:
            return false;
        }
      });

      if (filteredOrders.length > 0) {
        filteredGroups[clientName] = filteredOrders;
      }
    });

    return filteredGroups;
  }, [groupedOrders, isSearching, searchQuery, searchType]);

  const totalPages = Math.ceil(ordersData.totalCount / ITEMS_PER_PAGE);

  if (isLoadingOrders || isLoadingTotals) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-6">
        <TotalCards
          valorTotalSaldo={totals.valorTotalSaldo}
          valorFaturarComEstoque={totals.valorFaturarComEstoque}
        />

        <OrdersHeader
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={ordersData.totalCount}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          date={date}
          onDateChange={setDate}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />

        <div className="space-y-6">
          {Object.entries(filteredGroups).map(([clientName, orders]) => (
            <Card key={clientName} className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="text-lg font-medium">
                  Cliente: {clientName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {orders.map((order) => {
                    const orderId = `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
                    const isExpanded = expandedOrder === orderId;
                    const showZeroBalance = showZeroBalanceMap[orderId] || false;

                    return (
                      <OrderCard
                        key={orderId}
                        order={order}
                        isExpanded={isExpanded}
                        showZeroBalance={showZeroBalance}
                        onToggleExpand={() => toggleExpand(orderId)}
                        onToggleZeroBalance={() => toggleShowZeroBalance(orderId)}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <OrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
};

export default JabOrdersByClient;
