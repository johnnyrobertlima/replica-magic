
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions } from "@/types/jabOrders";
import { fetchJabOrders, fetchJabTotals } from "@/services/jabOrdersService";

export type { JabOrder } from "@/types/jabOrders";

export function useJabOrders(options: UseJabOrdersOptions = {}) {
  return useQuery({
    queryKey: ['jab-orders', options.dateRange?.from?.toISOString(), options.dateRange?.to?.toISOString(), options.page, options.pageSize],
    queryFn: () => fetchJabOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data) => {
      // Garantir que os pedidos têm todos os dados necessários
      const orders = data.orders.map(order => ({
        ...order,
        PES_CODIGO: order.PES_CODIGO || null, // Garantir que PES_CODIGO existe
        items: order.items?.map(item => ({
          ...item,
          QTDE_SALDO: item.QTDE_SALDO || 0,
          VALOR_UNITARIO: item.VALOR_UNITARIO || 0,
          DESCRICAO: item.DESCRICAO || null,
          FISICO: item.FISICO || 0,
          PES_CODIGO: order.PES_CODIGO // Adicionar PES_CODIGO do pedido aos itens
        }))
      }));

      return {
        ...data,
        orders
      };
    }
  });
}

export function useTotals() {
  return useQuery({
    queryKey: ['jab-totals'],
    queryFn: fetchJabTotals,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
