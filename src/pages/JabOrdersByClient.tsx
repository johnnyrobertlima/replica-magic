
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { ClientOrderCard } from "@/components/jab-orders-by-client/ClientOrderCard";
import type { ClientGroup } from "@/components/jab-orders-by-client/types";

const ITEMS_PER_PAGE = 15;

const JabOrdersByClient = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("cliente");
  const [isSearching, setIsSearching] = useState(false);

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders } = useJabOrders({
    dateRange: searchDate,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  };

  const clientGroups = useMemo(() => {
    const groups = new Map<string, ClientGroup>();

    ordersData.orders.forEach(order => {
      if (!["1", "2"].includes(order.STATUS)) return;

      const clientKey = `${order.PES_CODIGO || "unknown"}-${order.APELIDO || "Sem Nome"}`;
      
      if (!groups.has(clientKey)) {
        groups.set(clientKey, {
          clienteId: order.PES_CODIGO || null,
          clienteNome: order.APELIDO || null,
          pedidos: [],
          totalSaldo: 0,
          valorTotal: 0,
          valorFaturado: 0,
          valorFaturarComEstoque: 0
        });
      }

      const group = groups.get(clientKey)!;
      group.pedidos.push(order);
      group.totalSaldo += order.total_saldo;
      group.valorTotal += order.valor_total;

      if (order.items) {
        order.items.forEach(item => {
          group.valorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
          if ((item.FISICO || 0) > 0) {
            group.valorFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
          }
        });
      }
    });

    return Array.from(groups.values());
  }, [ordersData.orders]);

  const filteredClientGroups = useMemo(() => {
    if (!isSearching || !searchQuery) return clientGroups;

    const normalizedSearchQuery = searchQuery.toLowerCase().trim();
    
    return clientGroups.filter(group => {
      switch (searchType) {
        case "cliente":
          return group.clienteNome?.toLowerCase().includes(normalizedSearchQuery) || false;
        default:
          return true;
      }
    });
  }, [clientGroups, isSearching, searchQuery, searchType]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClientGroups.map((clientGroup) => (
            <ClientOrderCard
              key={`${clientGroup.clienteId}-${clientGroup.clienteNome}`}
              clientGroup={clientGroup}
            />
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
