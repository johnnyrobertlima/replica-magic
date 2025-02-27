import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useQueryClient } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders } = useJabOrders({
    dateRange: searchDate,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

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
      totalValorFaturarComEstoque: number,
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
          totalValorFaturarComEstoque: 0,
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
          pedido: order.PED_NUMPEDIDO,
          APELIDO: order.APELIDO,
          PES_CODIGO: order.PES_CODIGO
        })));

        order.items.forEach(item => {
          groups[clientKey].totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
          groups[clientKey].totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
          if ((item.FISICO || 0) > 0) {
            groups[clientKey].totalValorFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
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

  const handleItemSelect = (itemCode: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemCode)) {
        return prev.filter(code => code !== itemCode);
      }
      return [...prev, itemCode];
    });
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSending, setIsSending] = useState(false);

  const handleEnviarParaSeparacao = async () => {
    console.log('Iniciando envio para separação...');
    if (selectedItems.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um item para enviar para separação",
        variant: "default",
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Items selecionados:', selectedItems);
      let allSelectedItems: Array<{
        pedido: string;
        item: any;
        PES_CODIGO: number | null;
        APELIDO: string | null;
      }> = [];

      Object.values(groupedOrders).forEach(group => {
        group.allItems.forEach(item => {
          if (selectedItems.includes(item.ITEM_CODIGO)) {
            let pesCodigoNumerico = null;
            
            if (typeof item.PES_CODIGO === 'number') {
              pesCodigoNumerico = item.PES_CODIGO;
            } else if (typeof item.PES_CODIGO === 'string') {
              const parsed = parseInt(item.PES_CODIGO, 10);
              if (!isNaN(parsed)) {
                pesCodigoNumerico = parsed;
              }
            } else if (item.PES_CODIGO && typeof item.PES_CODIGO === 'object') {
              const value = item.PES_CODIGO.value;
              if (typeof value === 'string' || typeof value === 'number') {
                const parsed = parseInt(String(value), 10);
                if (!isNaN(parsed)) {
                  pesCodigoNumerico = parsed;
                }
              }
            }

            console.log('PES_CODIGO original:', item.PES_CODIGO);
            console.log('PES_CODIGO processado:', pesCodigoNumerico);

            allSelectedItems.push({
              pedido: item.pedido,
              item: item,
              PES_CODIGO: pesCodigoNumerico,
              APELIDO: item.APELIDO
            });
          }
        });
      });

      console.log('Items agrupados:', allSelectedItems);
      const itemsByClient: Record<string, typeof allSelectedItems> = {};
      
      allSelectedItems.forEach(item => {
        const clientName = item.APELIDO || "Sem Cliente";
        if (!itemsByClient[clientName]) {
          itemsByClient[clientName] = [];
        }
        itemsByClient[clientName].push(item);
      });

      console.log('Items por cliente:', itemsByClient);
      let successCount = 0;
      for (const [clientName, items] of Object.entries(itemsByClient)) {
        console.log(`Processando cliente: ${clientName}`);
        
        const clientItem = items.find(item => item.PES_CODIGO !== null);
        const clienteCode = clientItem?.PES_CODIGO;

        if (!clienteCode) {
          console.error(`Cliente ${clientName} sem código válido:`, items[0]);
          toast({
            title: "Erro",
            description: `Cliente ${clientName} não possui código válido`,
            variant: "destructive",
          });
          continue;
        }

        const valorTotal = items.reduce((sum, item) => 
          sum + (item.item.QTDE_SALDO * item.item.VALOR_UNITARIO), 0
        );

        console.log(`Inserindo separação para ${clientName} com código ${clienteCode}`);
        const { data: separacao, error: separacaoError } = await supabase
          .from('separacoes')
          .insert({
            cliente_nome: clientName,
            cliente_codigo: clienteCode,
            quantidade_itens: items.length,
            valor_total: valorTotal,
            status: 'pendente'
          })
          .select()
          .single();

        if (separacaoError) {
          console.error('Erro ao criar separação:', separacaoError);
          toast({
            title: "Erro",
            description: `Erro ao criar separação para ${clientName}`,
            variant: "destructive",
          });
          continue;
        }

        const separacaoItens = items.map(({ pedido, item }) => ({
          separacao_id: separacao.id,
          pedido: pedido,
          item_codigo: item.ITEM_CODIGO,
          descricao: item.DESCRICAO,
          quantidade_pedida: item.QTDE_SALDO,
          valor_unitario: item.VALOR_UNITARIO,
          valor_total: item.QTDE_SALDO * item.VALOR_UNITARIO
        }));

        console.log(`Inserindo itens para separação ${separacao.id}`);
        const { error: itensError } = await supabase
          .from('separacao_itens')
          .insert(separacaoItens);

        if (itensError) {
          console.error('Erro ao inserir itens:', itensError);
          toast({
            title: "Erro",
            description: `Erro ao inserir itens para ${clientName}`,
            variant: "destructive",
          });
          continue;
        }

        successCount++;
      }

      if (successCount > 0) {
        console.log(`Sucesso! ${successCount} separações criadas`);
        await queryClient.invalidateQueries({ queryKey: ['separacoes'] });
        
        toast({
          title: "Sucesso",
          description: `${successCount} separação(ões) criada(s) com sucesso!`,
          variant: "default",
        });

        setSelectedItems([]);
        setExpandedClients(new Set());
      } else {
        toast({
          title: "Aviso",
          description: "Nenhuma separação foi criada",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erro ao processar separação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar os itens para separação",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingOrders || isLoadingTotals || isLoadingSeparacoes) {
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
        <Tabs defaultValue="pedidos">
          <TabsList>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="separacoes">Separações ({separacoes.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pedidos">
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
                  ? (data.totalValorFaturarComEstoque / data.totalValorSaldo) * 100 
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
                              <p className="font-medium text-primary">{formatCurrency(data.totalValorFaturarComEstoque)}</p>
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
                                    <th className="text-left p-2"></th>
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
                                      <td className="p-2">
                                        <Checkbox
                                          checked={selectedItems.includes(item.ITEM_CODIGO)}
                                          onCheckedChange={() => handleItemSelect(item.ITEM_CODIGO)}
                                        />
                                      </td>
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

            {selectedItems.length > 0 && (
              <div className="fixed bottom-4 right-4 z-50">
                <Button
                  onClick={handleEnviarParaSeparacao}
                  disabled={isSending}
                  className="bg-primary text-white shadow-lg hover:bg-primary/90"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    `Enviar ${selectedItems.length} itens para Separação`
                  )}
                </Button>
              </div>
            )}

            <OrdersPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="separacoes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {separacoes.map((separacao) => (
                <SeparacaoCard key={separacao.id} separacao={separacao} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </main>
  );
};

export default JabOrdersByClient;
