
import { CalendarEvent } from "@/types/oni-agencia";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { CaptureEventsList } from "./CaptureEventsList";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";

interface CapturasContentProps {
  viewMode: "calendar" | "list";
  filteredSchedules: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  selectedCollaborator: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  showLoadingState: boolean;
  isCollapsed: boolean;
  onManualRefetch: () => void;
}

export function CapturasContent({
  viewMode,
  filteredSchedules,
  clientId,
  month,
  year,
  selectedCollaborator,
  onMonthYearChange,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  showLoadingState,
  isCollapsed,
  onManualRefetch
}: CapturasContentProps) {
  // Filter events to only those with capture_date
  const captureEvents = filteredSchedules.filter(event => event.capture_date);
  
  if (showLoadingState) {
    return <ContentScheduleLoading />;
  }
  
  return (
    <div className="w-full">
      {viewMode === "calendar" ? (
        <ContentCalendar
          events={captureEvents}
          month={month}
          year={year}
          clientId={clientId}
          onMonthYearChange={onMonthYearChange}
          isCollapsed={isCollapsed}
          onManualRefetch={onManualRefetch}
          useCaptureDate={true} // Flag para usar data de captura no calendário
          defaultTab="capture" // Abre na aba de captura por padrão
          prioritizeCaptureDate={true} // Prioritiza a data de captura
        />
      ) : (
        <CaptureEventsList
          events={captureEvents}
          clientId={clientId}
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
}
