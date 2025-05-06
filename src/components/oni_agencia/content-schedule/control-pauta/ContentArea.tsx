
import { useState } from "react";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { CalendarEvent } from "@/types/oni-agencia";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { ContentScheduleLoading } from "../ContentScheduleLoading";

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
  onManualRefetch?: () => void; // Adicionamos essa prop
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
    dndContext,
    handleEventClick,
    handleDateSelect,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  } = useDndContext({
    clientId,
    month,
    year,
    onManualRefetch // Passamos a função de atualização manual
  });
  
  // Caso esteja carregando, mostra um loader
  if (showLoadingState) {
    return <ContentScheduleLoading isCollapsed={isCollapsed} />;
  }
  
  if (viewMode === "calendar") {
    return (
      <div className={`pt-4 ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
        <dndContext.DndContext onDragEnd={handleDragEnd}>
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
            onManualRefetch={onManualRefetch} // Passamos a função de atualização manual
          />
        </dndContext.DndContext>
      </div>
    );
  }
  
  return (
    <div className={`pt-4 ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
      <ContentScheduleList 
        events={filteredSchedules} 
        clientId={clientId} 
        selectedCollaborator={selectedCollaborator}
        onManualRefetch={onManualRefetch} // Passamos a função de atualização manual
      />
    </div>
  );
}
