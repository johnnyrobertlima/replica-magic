
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions, JabTotalsResponse } from "@/types/jabOrders";
import { fetchJabOrders, fetchTotals, fetchAllJabOrders } from "@/services/jabOrdersService";

export type { JabOrder } from "@/types/jabOrders";

export function useJabOrders(options: UseJabOrdersOptions = {}) {
  return useQuery({
    queryKey: ['jab-orders', options.dateRange?.from?.toISOString(), options.dateRange?.to?.toISOString(), options.page, options.pageSize],
    queryFn: () => fetchJabOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllJabOrders(options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'> = {}) {
  const from = options.dateRange?.from;
  const to = options.dateRange?.to;
  
  return useQuery({
    queryKey: ['all-jab-orders', from?.toISOString(), to?.toISOString()],
    queryFn: () => fetchAllJabOrders(options),
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
