
import { useState } from "react";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { CalendarEvent } from "@/types/oni-agencia";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";
import { PautaStatusIndicator } from "@/components/oni_agencia/content-schedule/PautaStatusIndicator";
import { DndContext } from "@dnd-kit/core";

interface ContentAreaProps {
  viewMode: "calendar" | "list";
  filteredSchedules: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  selectedCollaborator?: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  showLoadingState: boolean;
  isCollapsed: boolean;
  onManualRefetch?: () => void;
}

export function ContentArea({ 
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
}: ContentAreaProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
  
  // Debug logs to track events count
  console.log(`ContentArea received ${filteredSchedules.length} events, showLoadingState=${showLoadingState}`);
  
  // Show status indicator when we have a valid clientId and data is loaded
  const showStatusIndicator = !!clientId && clientId !== "" && clientId !== "all" && !showLoadingState;
  
  // Caso esteja carregando, mostra um loader
  if (showLoadingState) {
    return <ContentScheduleLoading isCollapsed={isCollapsed} />;
  }
  
  return (
    <div className={`pt-4 ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
      {showStatusIndicator && (
        <PautaStatusIndicator 
          events={filteredSchedules}
          clientId={clientId}
          month={month}
          year={year}
          onManualRefetch={onManualRefetch}
        />
      )}
      
      {viewMode === "calendar" ? (
        <DndContext onDragEnd={handleDragEnd}>
          <Calendar 
            events={filteredSchedules}
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
          />
        </DndContext>
      ) : (
        <ContentScheduleList 
          events={filteredSchedules} 
          clientId={clientId} 
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
