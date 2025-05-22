
import { useEffect } from "react";
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { CalendarEvent } from "@/types/oni-agencia";
import { HistoryTimeline } from "./HistoryTimeline";

interface ScheduleHistoryProps {
  event: CalendarEvent;
}

export function ScheduleHistory({ event }: ScheduleHistoryProps) {
  const { data: history = [], isLoading, isError, error, refetch } = useScheduleHistory(event.id);

  // Refetch history data whenever event changes or description is updated
  useEffect(() => {
    if (event && event.id) {
      console.log("ScheduleHistory: Refetching history for event", event.id);
      refetch();
    }
  }, [event, event?.id, event?.description, refetch]);

  const handleRefetchResources = () => {
    console.log("ScheduleHistory: Manual refetch triggered");
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
