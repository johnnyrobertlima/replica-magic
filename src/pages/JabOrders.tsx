import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders, useTotals, type JabOrder } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import OrderCard from "@/components/jab-orders/OrderCard";
import SearchFilters from "@/components/jab-orders/SearchFilters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 15;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const JabOrders = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredOrders = ordersData.orders.filter((order: JabOrder) => {
    if (!["1", "2"].includes(order.STATUS)) {
      return false;
    }

    if (!isSearching) return true;
    
    if (searchQuery) {
      const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
      const normalizedSearchQuery = removeLeadingZeros(searchQuery);
      return normalizedOrderNumber.includes(normalizedSearchQuery);
    }
    
    return true;
  });

  const totalPages = Math.ceil(ordersData.totalCount / ITEMS_PER_PAGE);

  const renderPaginationLinks = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (startPage > 1) {
      pages.unshift(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    return pages;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-semibold text-gray-700">Valor Total Saldo</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totals.valorTotalSaldo)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-semibold text-gray-700">Faturar com Estoque</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totals.valorFaturarComEstoque)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Separação de Pedidos JAB</h1>
            <p className="text-muted-foreground">
              {ordersData.totalCount > 0 ? (
                `Exibindo página ${currentPage} de ${totalPages} (Total: ${ordersData.totalCount} pedidos)`
              ) : (
                "Nenhum pedido encontrado"
              )}
            </p>
          </div>
          <SearchFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            date={date}
            onDateChange={setDate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredOrders.map((order: JabOrder) => {
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

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {renderPaginationLinks()}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </main>
  );
};

export default JabOrders;
