
import { CalendarEvent } from "@/types/oni-agencia";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { CaptureEventsList } from "./CaptureEventsList";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { DndContext } from "@dnd-kit/core";

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
  
  // Use the same dndContext hook as in ContentArea for consistency
  const {
    selectedEvent,
    selectedDate,
    isDialogOpen,
    handleEventClick,
    handleDateSelect,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  } = useDndContext({
    clientId,
    month,
    year,
    onManualRefetch
  });
  
  if (showLoadingState) {
    return <ContentScheduleLoading />;
  }
  
  return (
    <div className="w-full">
      {viewMode === "calendar" ? (
        <DndContext onDragEnd={handleDragEnd}>
          <Calendar
            events={captureEvents}
            month={month}
            year={year}
            clientId={clientId}
            selectedCollaborator={selectedCollaborator}
            onMonthYearChange={onMonthYearChange}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            isDialogOpen={isDialogOpen}
            onDialogOpenChange={handleDialogOpenChange}
            onDialogClose={handleDialogClose}
            onManualRefetch={onManualRefetch}
            useCaptureDate={true} // Flag to use capture_date for displaying events
          />
        </DndContext>
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
