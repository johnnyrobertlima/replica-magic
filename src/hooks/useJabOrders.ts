
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

      // Fazendo uma única consulta que já traz os dados relacionados
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select(`
          *,
          pessoa:BLUEBAY_PESSOA!BLUEBAY_PEDIDO_PES_CODIGO_fkey(
            APELIDO
          ),
          item:BLUEBAY_ITEM!BLUEBAY_PEDIDO_ITEM_CODIGO_fkey(
            DESCRICAO
          )
        `)
        .eq('CENTROCUSTO', 'JAB')
        .in('STATUS', ['1', '2'])
        .gte('DATA_PEDIDO', startOfDay(dateRange.from).toISOString())
        .lte('DATA_PEDIDO', endOfDay(dateRange.to).toISOString());

      if (errorPedidos) throw errorPedidos;
      if (!pedidosData || pedidosData.length === 0) return [];

      console.log('Total de pedidos encontrados:', pedidosData.length);

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
            APELIDO: pedido.pessoa?.APELIDO || null,
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
              DESCRICAO: pedido.item?.DESCRICAO || null,
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
    cacheTime: 10 * 60 * 1000, // Mantém no cache por 10 minutos
  });
}
