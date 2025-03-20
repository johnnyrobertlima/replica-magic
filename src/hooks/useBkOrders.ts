
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions, JabTotalsResponse } from "@/types/jabOrders";
import { fetchBkOrders, fetchBkTotals, fetchAllBkOrders } from "@/services/bkOrdersService";

export function useBkOrders(options: UseJabOrdersOptions = {}) {
  const fromDate = options.dateRange?.from?.toISOString();
  const toDate = options.dateRange?.to?.toISOString();
  
  return useQuery({
    queryKey: ['bk-orders', fromDate, toDate, options.page, options.pageSize],
    queryFn: () => fetchBkOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllBkOrders(options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'> = {}) {
  const from = options.dateRange?.from;
  const to = options.dateRange?.to;
  
  // Cria strings no formato ISO para usar como keys de consulta
  const fromKey = from?.toISOString();
  const toKey = to?.toISOString();
  
  return useQuery({
    queryKey: ['all-bk-orders', fromKey, toKey],
    queryFn: () => fetchAllBkOrders(options),
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
}

export function useBkTotals() {
  return useQuery<JabTotalsResponse>({
    queryKey: ['bk-totals'],
    queryFn: fetchBkTotals,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
