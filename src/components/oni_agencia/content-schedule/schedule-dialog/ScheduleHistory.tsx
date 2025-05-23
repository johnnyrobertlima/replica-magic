
import { useEffect } from "react";
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { CalendarEvent } from "@/types/oni-agencia";
import { HistoryTimeline } from "./HistoryTimeline";
import { useQueryClient } from "@tanstack/react-query";

interface ScheduleHistoryProps {
  event: CalendarEvent;
}

export function ScheduleHistory({ event }: ScheduleHistoryProps) {
  const queryClient = useQueryClient();
  const { data: history = [], isLoading, isError, error, refetch } = useScheduleHistory(event.id);

  // Refetch history data whenever event changes or description is updated
  useEffect(() => {
    if (event && event.id) {
      console.log("ScheduleHistory: Refetching history for event", event.id);
      
      // Force refetch with a small delay to ensure data is committed
      const timeoutId = setTimeout(() => {
        console.log("ScheduleHistory: Invalidating and refetching history cache");
        queryClient.invalidateQueries({ queryKey: ['scheduleHistory', event.id] });
        refetch();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [event, event?.id, event?.description, event?.updated_at, refetch, queryClient]);

  const handleRefetchResources = () => {
    console.log("ScheduleHistory: Manual refetch triggered");
    // Invalidate the cache specifically for this event's history
    queryClient.invalidateQueries({ queryKey: ['scheduleHistory', event.id] });
    refetch();
  };

  return (
    <HistoryTimeline 
      historyData={history} 
      isLoading={isLoading} 
      isError={isError} 
      error={error}
      onRefetchResources={handleRefetchResources}
    />
  );
}
