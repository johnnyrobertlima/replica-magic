
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

      // Primeiro, buscamos os pedidos
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select()
        .eq('CENTROCUSTO', 'JAB')
        .in('STATUS', ['1', '2'])
        .gte('DATA_PEDIDO', startOfDay(dateRange.from).toISOString())
        .lte('DATA_PEDIDO', endOfDay(dateRange.to).toISOString());

      if (errorPedidos) throw errorPedidos;
      if (!pedidosData || pedidosData.length === 0) return [];

      console.log('Total de pedidos encontrados:', pedidosData.length);

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

      // Criamos os mapas para lookup rápido
      const apelidoMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );

      // Criamos um Map para armazenar os pedidos agrupados
      const ordersMap = new Map<string, JabOrder>();

      // Processamos os pedidos em um único loop
      for (const pedido of pedidosData) {
        if (!pedido.FILIAL || !pedido.PED_NUMPEDIDO || !pedido.PED_ANOBASE || !pedido.MATRIZ) {
          continue;
        }

        const key = `${pedido.FILIAL}-${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}`;
        const saldo = pedido.QTDE_SALDO || 0;
        const valorUnitario = pedido.VALOR_UNITARIO || 0;

        if (!ordersMap.has(key)) {
          ordersMap.set(key, {
            MATRIZ: pedido.MATRIZ,
            FILIAL: pedido.FILIAL,
            PED_NUMPEDIDO: pedido.PED_NUMPEDIDO,
            PED_ANOBASE: pedido.PED_ANOBASE,
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
              VALOR_UNITARIO: valorUnitario
            });
          }
        }
      }

      const ordersArray = Array.from(ordersMap.values());

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
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Mantém no cache por 10 minutos (anteriormente cacheTime)
  });
}
