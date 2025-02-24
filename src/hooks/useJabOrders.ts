
import { useQuery } from "@tanstack/react-query";
import type { UseJabOrdersOptions, JabOrdersResponse, JabTotalsResponse } from "@/types/jabOrders";
import { fetchJabOrders, fetchJabTotals } from "@/services/jabOrdersService";

export function useJabOrders(options: UseJabOrdersOptions = {}) {
  return useQuery({
    queryKey: ['jab-orders', options.dateRange?.from?.toISOString(), options.dateRange?.to?.toISOString(), options.page, options.pageSize],
    queryFn: () => fetchJabOrders(options),
    enabled: !!options.dateRange?.from && !!options.dateRange?.to
  });
}

export function useTotals() {
  return useQuery<JabTotalsResponse>({
    queryKey: ['jab-totals'],
    queryFn: fetchJabTotals
  });
}
