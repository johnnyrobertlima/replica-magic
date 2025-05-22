
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { CalendarEvent } from "@/types/oni-agencia";
import { HistoryTimeline } from "./HistoryTimeline";

interface ScheduleHistoryProps {
  event: CalendarEvent;
}

export function ScheduleHistory({ event }: ScheduleHistoryProps) {
  const { data: history = [], isLoading, isError, error, refetch } = useScheduleHistory(event.id);

  const handleRefetchResources = () => {
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
