
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderItemsTable } from "@/components/jab-orders/OrderItemsTable";

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

  // Agrupa e consolida os pedidos por cliente
  const groupedOrders = useMemo(() => {
    const groups: Record<string, {
      orders: typeof ordersData.orders,
      totalSaldo: number,
      totalPedido: number,
      totalFaturado: number,
      totalFaturarComEstoque: number,
      representante: string | null
    }> = {};
    
    ordersData.orders.forEach((order) => {
      if (!["1", "2"].includes(order.STATUS)) return;
      
      const clientKey = order.APELIDO || "Sem Cliente";
      if (!groups[clientKey]) {
        groups[clientKey] = {
          orders: [],
          totalSaldo: 0,
          totalPedido: 0,
          totalFaturado: 0,
          totalFaturarComEstoque: 0,
          representante: order.REPRESENTANTE_NOME
        };
      }

      groups[clientKey].orders.push(order);
      groups[clientKey].totalSaldo += order.valor_total || 0;

      // Calcula totais baseados nos itens
      order.items?.forEach(item => {
        groups[clientKey].totalPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
        groups[clientKey].totalFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
        if ((item.FISICO || 0) > 0) {
          groups[clientKey].totalFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
        }
      });
    });

    return groups;
  }, [ordersData.orders]);

  // Filtra os grupos
  const filteredGroups = useMemo(() => {
    if (!isSearching || !searchQuery) return groupedOrders;

    const normalizedSearchQuery = searchQuery.toLowerCase().trim();
    const filteredGroups: typeof groupedOrders = {};

    Object.entries(groupedOrders).forEach(([clientName, groupData]) => {
      let shouldInclude = false;

      switch (searchType) {
        case "pedido":
          shouldInclude = groupData.orders.some(order => {
            const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
            const normalizedSearchNumber = removeLeadingZeros(searchQuery);
            return normalizedOrderNumber.includes(normalizedSearchNumber);
          });
          break;
        
        case "cliente":
          shouldInclude = clientName.toLowerCase().includes(normalizedSearchQuery);
          break;
        
        case "representante":
          shouldInclude = groupData.representante?.toLowerCase().includes(normalizedSearchQuery) || false;
          break;
      }

      if (shouldInclude) {
        filteredGroups[clientName] = groupData;
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

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
          {Object.entries(filteredGroups).map(([clientName, data]) => (
            <Card key={clientName} className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="text-lg font-medium">
                  <div className="flex justify-between items-center">
                    <div>
                      Cliente: {clientName}
                      {data.representante && (
                        <span className="text-sm text-muted-foreground ml-2">
                          | Representante: {data.representante}
                        </span>
                      )}
                    </div>
                    <div className="text-primary">{formatCurrency(data.totalSaldo)}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total em Pedidos</p>
                      <p className="text-lg font-medium">{formatCurrency(data.totalPedido)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Faturado</p>
                      <p className="text-lg font-medium">{formatCurrency(data.totalFaturado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total em Saldo</p>
                      <p className="text-lg font-medium">{formatCurrency(data.totalSaldo)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Faturar com Estoque</p>
                      <p className="text-lg font-medium text-primary">{formatCurrency(data.totalFaturarComEstoque)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.orders.map((order) => (
                      <OrderCard
                        key={`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`}
                        order={order}
                        isExpanded={expandedOrder === `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`}
                        showZeroBalance={showZeroBalanceMap[`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`] || false}
                        onToggleExpand={() => toggleExpand(`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`)}
                        onToggleZeroBalance={() => toggleShowZeroBalance(`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`)}
                      />
                    ))}
                  </div>
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
