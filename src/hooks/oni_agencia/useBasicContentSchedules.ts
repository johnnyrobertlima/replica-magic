
import { useQuery } from "@tanstack/react-query";
import { getContentSchedules, getAllContentSchedules } from "@/services/oniAgenciaContentScheduleServices";

// Cache time constants
const MINUTE = 60 * 1000;
const CACHE_TIME = 60 * MINUTE; // 60 minutes
const STALE_TIME = 15 * MINUTE;  // 15 minutes

export function useContentSchedules(clientId: string, year: number, month: number) {
  return useQuery({
    queryKey: ['oniAgenciaContentSchedules', clientId, year, month],
    queryFn: () => getContentSchedules(clientId, year, month),
    enabled: !!clientId && !!year && !!month,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: attempt => Math.min(attempt * 1000, 3000)
  });
}

export function useAllContentSchedules(year: number, month: number) {
  return useQuery({
    queryKey: ['allOniAgenciaContentSchedules', year, month],
    queryFn: () => getAllContentSchedules(year, month),
    enabled: !!year && !!month,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: attempt => Math.min(attempt * 1000, 3000),
    refetchInterval: false,
  });
}
