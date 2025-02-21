import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 15;

const JabOrdersByClient = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("pedido");
  const [isSearching, setIsSearching] = useState(false);
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders } = useJabOrders({
    dateRange: searchDate,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const toggleExpand = (clientName: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientName)) {
        newSet.delete(clientName);
      } else {
        newSet.add(clientName);
      }
      return newSet;
    });
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  };

  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  };

  const groupedOrders = useMemo(() => {
    const groups: Record<string, {
      pedidos: typeof ordersData.orders,
      totalQuantidadeSaldo: number,
      totalValorSaldo: number,
      totalValorPedido: number,
      totalValorFaturado: number,
      totalFaturarComEstoque: number,
      representante: string | null,
      allItems: any[]
    }> = {};
    
    ordersData.orders.forEach((order) => {
      if (!["1", "2"].includes(order.STATUS)) return;
      
      const clientKey = order.APELIDO || "Sem Cliente";
      if (!groups[clientKey]) {
        groups[clientKey] = {
          pedidos: [],
          totalQuantidadeSaldo: 0,
          totalValorSaldo: 0,
          totalValorPedido: 0,
          totalValorFaturado: 0,
          totalFaturarComEstoque: 0,
          representante: order.REPRESENTANTE_NOME,
          allItems: []
        };
      }

      groups[clientKey].pedidos.push(order);
      groups[clientKey].totalQuantidadeSaldo += order.total_saldo || 0;
      groups[clientKey].totalValorSaldo += order.valor_total || 0;

      if (order.items) {
        groups[clientKey].allItems.push(...order.items.map(item => ({
          ...item,
          pedido: order.PED_NUMPEDIDO
        })));

        order.items.forEach(item => {
          groups[clientKey].totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
          groups[clientKey].totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
          if ((item.FISICO || 0) > 0) {
            groups[clientKey].totalFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
          }
        });
      }
    });

    return groups;
  }, [ordersData.orders]);

  const filteredGroups = useMemo(() => {
    if (!isSearching || !searchQuery) return groupedOrders;

    const normalizedSearchQuery = searchQuery.toLowerCase().trim();
    const filteredGroups: typeof groupedOrders = {};

    Object.entries(groupedOrders).forEach(([clientName, groupData]) => {
      let shouldInclude = false;

      switch (searchType) {
        case "pedido":
          shouldInclude = groupData.pedidos.some(order => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(filteredGroups).map(([clientName, data]) => {
            const isExpanded = expandedClients.has(clientName);
            const progressFaturamento = data.totalValorPedido > 0 
              ? (data.totalValorFaturado / data.totalValorPedido) * 100 
              : 0;
            const progressPotencial = data.totalValorSaldo > 0 
              ? (data.totalFaturarComEstoque / data.totalValorSaldo) * 100 
              : 0;
            const pedidosCount = new Set(data.allItems.map(item => item.pedido)).size;

            return (
              <Card 
                key={clientName} 
                className={cn(
                  "overflow-hidden",
                  isExpanded && "col-span-full"
                )}
              >
                <CardContent className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(clientName)}
                  >
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Cliente: {clientName}</h3>
                      {data.representante && (
                        <p className="text-sm text-muted-foreground">
                          Representante: {data.representante}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Total de Pedidos: {pedidosCount}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Faturamento</span>
                          <span>{Math.round(progressFaturamento)}%</span>
                        </div>
                        <Progress value={progressFaturamento} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Potencial com Estoque</span>
                          <span>{Math.round(progressPotencial)}%</span>
                        </div>
                        <Progress value={progressPotencial} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantidade Saldo:</p>
                          <p className="font-medium">{data.totalQuantidadeSaldo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Total Saldo:</p>
                          <p className="font-medium">{formatCurrency(data.totalValorSaldo)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Total do Pedido:</p>
                          <p className="font-medium">{formatCurrency(data.totalValorPedido)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Faturado:</p>
                          <p className="font-medium">{formatCurrency(data.totalValorFaturado)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Faturar com Estoque:</p>
                          <p className="font-medium text-primary">{formatCurrency(data.totalFaturarComEstoque)}</p>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6">
                        <div className="mb-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showZeroBalance}
                              onCheckedChange={setShowZeroBalance}
                              id="show-zero-balance"
                              className="data-[state=checked]:bg-[#8B5CF6]"
                            />
                            <label 
                              htmlFor="show-zero-balance"
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              Mostrar itens com saldo zero
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={showOnlyWithStock}
                              onCheckedChange={setShowOnlyWithStock}
                              id="show-only-with-stock"
                              className="data-[state=checked]:bg-[#8B5CF6]"
                            />
                            <label 
                              htmlFor="show-only-with-stock"
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              Mostrar apenas itens com estoque físico
                            </label>
                          </div>
                        </div>

                        <div className="rounded-lg border overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-2">Pedido</th>
                                <th className="text-left p-2">SKU</th>
                                <th className="text-left p-2">Descrição</th>
                                <th className="text-right p-2">Qt. Pedida</th>
                                <th className="text-right p-2">Qt. Entregue</th>
                                <th className="text-right p-2">Qt. Saldo</th>
                                <th className="text-right p-2">Qt. Físico</th>
                                <th className="text-right p-2">Valor Unit.</th>
                                <th className="text-right p-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.allItems
                                .filter(item => {
                                  if (!showZeroBalance && item.QTDE_SALDO <= 0) return false;
                                  if (showOnlyWithStock && (item.FISICO || 0) <= 0) return false;
                                  return true;
                                })
                                .map((item, index) => (
                                <tr key={`${item.pedido}-${item.ITEM_CODIGO}-${index}`} className="border-t">
                                  <td className="p-2">{item.pedido}</td>
                                  <td className="p-2">{item.ITEM_CODIGO}</td>
                                  <td className="p-2">{item.DESCRICAO || '-'}</td>
                                  <td className="p-2 text-right">{item.QTDE_PEDIDA}</td>
                                  <td className="p-2 text-right">{item.QTDE_ENTREGUE}</td>
                                  <td className="p-2 text-right">{item.QTDE_SALDO}</td>
                                  <td className="p-2 text-right">{item.FISICO || '-'}</td>
                                  <td className="p-2 text-right">
                                    {item.VALOR_UNITARIO.toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    })}
                                  </td>
                                  <td className="p-2 text-right">
                                    {(item.QTDE_SALDO * item.VALOR_UNITARIO).toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
