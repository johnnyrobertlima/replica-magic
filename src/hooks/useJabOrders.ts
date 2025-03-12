
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions, JabTotalsResponse } from "@/types/jabOrders";
import { fetchAllJabOrders } from "@/services/jab-orders/orderFetchService";
import { fetchTotals } from "@/services/jab-orders/totalsService";

export type { JabOrder } from "@/types/jabOrders";

export function useJabOrders(options: UseJabOrdersOptions = {}) {
  return useQuery({
    queryKey: ['jab-orders', options.dateRange?.from?.toISOString(), options.dateRange?.to?.toISOString(), options.page, options.pageSize],
    queryFn: () => fetchAllJabOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllJabOrders(options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'> = {}) {
  return useQuery({
    queryKey: ['all-jab-orders', options.dateRange?.from?.toISOString(), options.dateRange?.to?.toISOString()],
    queryFn: () => fetchAllJabOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to,
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
