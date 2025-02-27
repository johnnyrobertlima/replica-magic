
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions, JabTotalsResponse, UseJabOrdersByClientOptions } from "@/types/jabOrders";
import { fetchJabOrders, fetchTotals, fetchJabOrdersByClient } from "@/services/jabOrdersService";

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

export function useJabOrdersByClient(options: UseJabOrdersByClientOptions = {}) {
  return useQuery({
    queryKey: ['jab-orders-by-client', options.dateRange?.from?.toISOString(), options.dateRange?.to?.toISOString()],
    queryFn: () => fetchJabOrdersByClient(options),
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
