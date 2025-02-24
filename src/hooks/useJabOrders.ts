
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
