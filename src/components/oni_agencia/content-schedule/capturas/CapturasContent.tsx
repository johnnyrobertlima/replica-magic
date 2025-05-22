
import { CalendarEvent } from "@/types/oni-agencia";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { CaptureEventsList } from "./CaptureEventsList";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { DndContext } from "@dnd-kit/core";
import { useCustomDndSensors } from "@/components/oni_agencia/content-schedule/hooks/useCustomSensors";

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
  onDialogStateChange?: (open: boolean) => void;
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
  onManualRefetch,
  onDialogStateChange
}: CapturasContentProps) {
  // These events should already be filtered for capture date in the useCapturasFiltering hook
  const captureEvents = filteredSchedules;
  
  // Add a log for debugging
  console.log(`CapturasContent - Displaying ${captureEvents.length} capture events`);
  
  // Configure sensors with zero delay for better responsiveness
  const sensors = useCustomDndSensors(0, 3);
  
  // Use the same dndContext hook as in ContentArea for consistency
  const {
    selectedEvent,
    selectedDate,
    isDialogOpen,
    handleEventClick,
    handleDateSelect,
    handleDragStart,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  } = useDndContext({
    clientId,
    month,
    year,
    onManualRefetch
  });
  
  // Notify parent component about dialog state changes
  const handleDialogOpen = (open: boolean) => {
    handleDialogOpenChange(open);
    if (onDialogStateChange) {
      onDialogStateChange(open);
    }
  };
  
  const handleDialogCloseWithNotify = () => {
    handleDialogClose();
    if (onDialogStateChange) {
      onDialogStateChange(false);
    }
  };
  
  if (showLoadingState) {
    return <ContentScheduleLoading isCollapsed={isCollapsed} />;
  }
  
  return (
    <div className="w-full pt-4">
      {viewMode === "calendar" ? (
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
            onDialogOpenChange={handleDialogOpen}
            onDialogClose={handleDialogCloseWithNotify}
            onManualRefetch={onManualRefetch}
            useCaptureDate={true}
            prioritizeCaptureDate={true}
            defaultTab="capture"
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
          onDialogStateChange={onDialogStateChange}
        />
      )}
    </div>
  );
}
