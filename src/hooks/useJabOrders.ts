
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions, JabTotalsResponse } from "@/types/jabOrders";
import { fetchOrders, fetchTotals, fetchAllOrders } from "@/services/jabOrdersService";

export type { JabOrder } from "@/types/jabOrders";

export function useJabOrders(options: UseJabOrdersOptions = {}) {
  const fromDate = options.dateRange?.from?.toISOString();
  const toDate = options.dateRange?.to?.toISOString();
  
  return useQuery({
    queryKey: ['jab-orders', fromDate, toDate, options.page, options.pageSize],
    queryFn: () => fetchOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllJabOrders(options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'> = {}) {
  const from = options.dateRange?.from;
  const to = options.dateRange?.to;
  
  // Cria strings no formato ISO para usar como keys de consulta
  const fromKey = from?.toISOString();
  const toKey = to?.toISOString();
  
  console.log('useAllJabOrders hook called with date range:', { from, to });
  
  return useQuery({
    queryKey: ['all-jab-orders', fromKey, toKey],
    queryFn: () => {
      console.log('Fetching all JAB orders for date range:', { from, to });
      return fetchAllOrders(options);
    },
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
}

export function useTotals() {
  return useQuery<JabTotalsResponse>({
    queryKey: ['jab-totals'],
    queryFn: fetchTotals,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
