
import { useState, useMemo } from "react";
import { useAllJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export const useClientOrders = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("pedido");
  const [isSearching, setIsSearching] = useState(false);
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItemsDetails, setSelectedItemsDetails] = useState<Record<string, { qtde: number, valor: number }>>({});
  const [isSending, setIsSending] = useState(false);

  const { data: ordersData = { orders: [], totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders } = useAllJabOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate the total of selected items
  const totalSelecionado = useMemo(() => {
    return Object.values(selectedItemsDetails).reduce((total, item) => {
      return total + (item.qtde * item.valor);
    }, 0);
  }, [selectedItemsDetails]);

  // Group orders by client
  const groupedOrders = useMemo(() => {
    const groups: Record<string, {
      pedidos: typeof ordersData.orders,
      totalQuantidadeSaldo: number,
      totalValorSaldo: number,
      totalValorPedido: number,
      totalValorFaturado: number,
      totalValorFaturarComEstoque: number,
      representante: string | null,
      allItems: any[],
      PES_CODIGO: number
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
          allItems: [],
          PES_CODIGO: order.PES_CODIGO
        };
      }

      groups[clientKey].pedidos.push(order);
      groups[clientKey].totalQuantidadeSaldo += order.total_saldo || 0;
      groups[clientKey].totalValorSaldo += order.valor_total || 0;

      if (order.items) {
        const items = order.items.map(item => ({
          ...item,
          pedido: order.PED_NUMPEDIDO,
          APELIDO: order.APELIDO,
          PES_CODIGO: order.PES_CODIGO
        }));
        
        groups[clientKey].allItems.push(...items);
        
        order.items.forEach(item => {
          groups[clientKey].totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
          groups[clientKey].totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
          if ((item.FISICO || 0) > 0) {
            groups[clientKey].totalValorFaturarComEstoque += Math.min(item.QTDE_SALDO, item.FISICO || 0) * item.VALOR_UNITARIO;
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

    const removeLeadingZeros = (str: string) => {
      return str.replace(/^0+/, '');
    };

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
  };

  const handleItemSelect = (item: any) => {
    const itemCode = item.ITEM_CODIGO;
    
    setSelectedItems(prev => {
      const isAlreadySelected = prev.includes(itemCode);
      let newSelectedItems = prev;
      
      if (isAlreadySelected) {
        // Remove item from selection
        newSelectedItems = prev.filter(code => code !== itemCode);
        
        // Remove item details
        setSelectedItemsDetails(prevDetails => {
          const newDetails = {...prevDetails};
          delete newDetails[itemCode];
          return newDetails;
        });
      } else {
        // Add item to selection
        newSelectedItems = [...prev, itemCode];
        
        // Add item details
        setSelectedItemsDetails(prevDetails => ({
          ...prevDetails,
          [itemCode]: {
            qtde: item.QTDE_SALDO,
            valor: item.VALOR_UNITARIO
          }
        }));
      }
      
      return newSelectedItems;
    });
  };

  const handleEnviarParaSeparacao = async () => {
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

      const itemsByClient: Record<string, typeof allSelectedItems> = {};
      
      allSelectedItems.forEach(item => {
        const clientName = item.APELIDO || "Sem Cliente";
        if (!itemsByClient[clientName]) {
          itemsByClient[clientName] = [];
        }
        itemsByClient[clientName].push(item);
      });

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
        await queryClient.invalidateQueries({ queryKey: ['jabOrders'] });
        
        toast({
          title: "Sucesso",
          description: `${successCount} separação(ões) criada(s) com sucesso!`,
          variant: "default",
        });

        setSelectedItems([]);
        setSelectedItemsDetails({});
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
