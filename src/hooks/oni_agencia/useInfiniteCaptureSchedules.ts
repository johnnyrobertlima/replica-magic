
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCaptureSchedulesPaginated } from "@/services/oniAgencia/getCaptureSchedules";

export function useInfiniteCaptureSchedules(
  clientId: string | null,
  year: number,
  month: number,
  collaboratorId: string | null = null,
  enableAutoFetch: boolean = false,
  pageSize: number = 30
) {
  return useInfiniteQuery({
    queryKey: ['captureSchedules', clientId, year, month, collaboratorId],
    queryFn: ({ pageParam = 1 }) => 
      getCaptureSchedulesPaginated(clientId, year, month, collaboratorId, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!clientId && enableAutoFetch,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
