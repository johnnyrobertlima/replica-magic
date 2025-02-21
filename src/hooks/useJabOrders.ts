
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, formatISO } from "date-fns";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import type { Database } from "@/integrations/supabase/types";

type BluebayPedido = Database["public"]["Tables"]["BLUEBAY_PEDIDO"]["Row"];
type SupabasePedido = Partial<BluebayPedido>;

export interface JabOrder {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  total_saldo: number;
  valor_total: number;
  APELIDO: string | null;
  PEDIDO_CLIENTE: string | null;
  STATUS: string;
  items: Array<{
    ITEM_CODIGO: string;
    DESCRICAO: string | null;
    QTDE_SALDO: number;
    QTDE_PEDIDA: number;
    QTDE_ENTREGUE: number;
    VALOR_UNITARIO: number;
    FISICO: number | null;
  }>;
}

export function useJabOrders(dateRange?: DayPickerDateRange) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      // Ajustando o formato das datas para considerar o timezone corretamente
      const dataInicial = formatISO(startOfDay(dateRange.from), { format: 'extended' });
      const dataFinal = formatISO(endOfDay(dateRange.to), { format: 'extended' });

      console.log('Buscando pedidos para o período:', { 
        dataInicial,
        dataFinal,
        fromDate: dateRange.from,
        toDate: dateRange.to
      });

      // Primeiro fazemos uma query para pegar todos os pedidos do período
      const { data: todosPedidos, error: errorTodosPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, DATA_PEDIDO, STATUS')
        .eq('CENTROCUSTO', 'JAB')
        .gte('DATA_PEDIDO', dataInicial)
        .lte('DATA_PEDIDO', dataFinal);

      if (errorTodosPedidos) {
        console.error('Erro ao buscar todos os pedidos:', errorTodosPedidos);
        throw errorTodosPedidos;
      }

      console.log('Dados brutos de TODOS os pedidos antes do filtro de status:', todosPedidos?.map(p => ({
        PED_NUMPEDIDO: p.PED_NUMPEDIDO,
        DATA_PEDIDO: p.DATA_PEDIDO,
        STATUS: p.STATUS
      })));

      // Filtramos os pedidos por status após a busca para ver quais estão sendo excluídos
      const pedidosComStatusValido = todosPedidos?.filter(p => ['1', '2'].includes(p.STATUS)) || [];

      console.log('Pedidos filtrados por status (1 e 2):', pedidosComStatusValido.map(p => ({
        PED_NUMPEDIDO: p.PED_NUMPEDIDO,
        DATA_PEDIDO: p.DATA_PEDIDO,
        STATUS: p.STATUS
      })));

      const numeroPedidosDistintos = [...new Set(pedidosComStatusValido.map(p => p.PED_NUMPEDIDO))];
      
      console.log('Total de pedidos distintos encontrados:', numeroPedidosDistintos.length);
      console.log('Lista de pedidos distintos:', numeroPedidosDistintos);

      // Agora buscamos todos os dados desses pedidos
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select()
        .eq('CENTROCUSTO', 'JAB')
        .in('PED_NUMPEDIDO', numeroPedidosDistintos)
        .order('DATA_PEDIDO', { ascending: false });

      if (errorPedidos) {
        console.error('Erro ao buscar detalhes dos pedidos:', errorPedidos);
        throw errorPedidos;
      }
      
      if (!pedidosData || pedidosData.length === 0) {
        console.log('Nenhum pedido encontrado para o período');
        return [];
      }

      console.log('Pedidos encontrados com todos os detalhes:', pedidosData.map(p => ({
        PED_NUMPEDIDO: p.PED_NUMPEDIDO,
        DATA_PEDIDO: p.DATA_PEDIDO,
        STATUS: p.STATUS
      })));

      // Buscamos os apelidos das pessoas
      const pessoasIds = [...new Set(pedidosData.map(p => p.PES_CODIGO).filter(Boolean))];
      const { data: pessoas } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', pessoasIds);

      // Buscamos as descrições dos itens
      const itemCodigos = [...new Set(pedidosData.map(p => p.ITEM_CODIGO).filter(Boolean))];
      const { data: itens } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', itemCodigos);

      // Buscamos o estoque físico dos itens
      const { data: estoque } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select('ITEM_CODIGO, FISICO')
        .in('ITEM_CODIGO', itemCodigos);

      // Criamos os mapas para lookup rápido
      const apelidoMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );
      const estoqueMap = new Map(
        estoque?.map(e => [e.ITEM_CODIGO, e.FISICO]) || []
      );

      // Agora agrupamos apenas por número do pedido
      const ordersMap = new Map<string, JabOrder>();

      for (const pedido of pedidosData) {
        // Alterado para agrupar apenas por PED_NUMPEDIDO
        const key = `${pedido.PED_NUMPEDIDO}`;
        const saldo = pedido.QTDE_SALDO || 0;
        const valorUnitario = pedido.VALOR_UNITARIO || 0;

        if (!ordersMap.has(key)) {
          ordersMap.set(key, {
            MATRIZ: pedido.MATRIZ || 0,
            FILIAL: pedido.FILIAL ?? 0,
            PED_NUMPEDIDO: pedido.PED_NUMPEDIDO || '',
            PED_ANOBASE: pedido.PED_ANOBASE || 0,
            total_saldo: saldo,
            valor_total: saldo * valorUnitario,
            APELIDO: pedido.PES_CODIGO ? apelidoMap.get(pedido.PES_CODIGO) || null : null,
            PEDIDO_CLIENTE: pedido.PEDIDO_CLIENTE || null,
            STATUS: pedido.STATUS || '',
            items: []
          });
        } else {
          const order = ordersMap.get(key)!;
          order.total_saldo += saldo;
          order.valor_total += saldo * valorUnitario;
        }

        if (pedido.ITEM_CODIGO) {
          const order = ordersMap.get(key)!;
          const existingItemIndex = order.items.findIndex(item => item.ITEM_CODIGO === pedido.ITEM_CODIGO);
          
          if (existingItemIndex === -1) {
            order.items.push({
              ITEM_CODIGO: pedido.ITEM_CODIGO,
              DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
              QTDE_SALDO: saldo,
              QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
              QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
              VALOR_UNITARIO: valorUnitario,
              FISICO: estoqueMap.get(pedido.ITEM_CODIGO) || null
            });
          }
        }
      }

      const ordersArray = Array.from(ordersMap.values());

      console.log('Número final de pedidos agrupados:', ordersArray.length);
      console.log('Lista final de números de pedidos:', ordersArray.map(o => o.PED_NUMPEDIDO));

      return ordersArray;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
