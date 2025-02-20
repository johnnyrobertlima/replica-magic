
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
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
  }>;
}

export function useJabOrders(dateRange?: DayPickerDateRange) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      console.log('Buscando pedidos para o período:', { from: dateRange.from, to: dateRange.to });

      // Primeiro, buscamos os pedidos com paginação para garantir todos os resultados
      let allPedidos: SupabasePedido[] = [];
      let page = 0;
      const pageSize = 1000;
      
      while (true) {
        const { data: pedidosPage, error: errorPedidos, count } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select(`
            MATRIZ,
            FILIAL,
            PED_NUMPEDIDO,
            PED_ANOBASE,
            QTDE_SALDO,
            QTDE_PEDIDA,
            QTDE_ENTREGUE,
            VALOR_UNITARIO,
            PES_CODIGO,
            ITEM_CODIGO,
            STATUS,
            PEDIDO_CLIENTE
          `, { count: 'exact' })
          .eq('CENTROCUSTO', 'JAB')
          .gte('DATA_PEDIDO', startOfDay(dateRange.from).toISOString())
          .lte('DATA_PEDIDO', endOfDay(dateRange.to).toISOString())
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (errorPedidos) throw errorPedidos;
        if (!pedidosPage || pedidosPage.length === 0) break;

        allPedidos = [...allPedidos, ...pedidosPage];
        if (!count || allPedidos.length >= count) break;
        
        page++;
      }

      console.log('Total de pedidos encontrados:', allPedidos.length);

      if (allPedidos.length === 0) return [];

      // Buscamos os apelidos das pessoas
      const pessoasIds = [...new Set(allPedidos.map(p => p.PES_CODIGO).filter(Boolean))];
      const { data: pessoas, error: errorPessoas } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', pessoasIds);

      if (errorPessoas) throw errorPessoas;

      // Buscamos as descrições dos itens
      const itemCodigos = [...new Set(allPedidos.map(p => p.ITEM_CODIGO).filter(Boolean))];
      const { data: itens, error: errorItens } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', itemCodigos);

      if (errorItens) throw errorItens;

      // Criamos os mapas para lookup rápido
      const apelidoMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );

      // Agrupamos os pedidos primeiro por PED_NUMPEDIDO, PED_ANOBASE e FILIAL
      const groupedOrders: Record<string, JabOrder> = {};

      for (const pedido of allPedidos) {
        if (!pedido.FILIAL || !pedido.PED_NUMPEDIDO || !pedido.PED_ANOBASE || !pedido.MATRIZ) {
          continue; // Skip invalid orders
        }

        const key = `${pedido.FILIAL}-${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}`;
        
        if (!groupedOrders[key]) {
          groupedOrders[key] = {
            MATRIZ: pedido.MATRIZ,
            FILIAL: pedido.FILIAL,
            PED_NUMPEDIDO: pedido.PED_NUMPEDIDO,
            PED_ANOBASE: pedido.PED_ANOBASE,
            total_saldo: 0,
            valor_total: 0,
            APELIDO: pedido.PES_CODIGO ? apelidoMap.get(pedido.PES_CODIGO) || null : null,
            PEDIDO_CLIENTE: pedido.PEDIDO_CLIENTE || null,
            STATUS: pedido.STATUS || '',
            items: []
          };
        }
        
        const saldo = pedido.QTDE_SALDO || 0;
        const valorUnitario = pedido.VALOR_UNITARIO || 0;
        
        groupedOrders[key].total_saldo += saldo;
        groupedOrders[key].valor_total += saldo * valorUnitario;
        
        // Adiciona o item ao array de items
        if (pedido.ITEM_CODIGO) {
          const existingItemIndex = groupedOrders[key].items.findIndex(item => item.ITEM_CODIGO === pedido.ITEM_CODIGO);
          if (existingItemIndex === -1) {
            groupedOrders[key].items.push({
              ITEM_CODIGO: pedido.ITEM_CODIGO,
              DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
              QTDE_SALDO: saldo,
              QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
              QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
              VALOR_UNITARIO: valorUnitario
            });
          }
        }
      }

      const ordersArray = Object.values(groupedOrders);

      console.log('Número de pedidos agrupados:', ordersArray.length);
      if (ordersArray.length > 0) {
        console.log('Exemplo de pedido agrupado:', {
          numero: ordersArray[0].PED_NUMPEDIDO,
          quantidadeItens: ordersArray[0].items.length,
          primeiroItem: ordersArray[0].items[0]
        });
      }
      
      return ordersArray;
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });
}
