
import { useState, useEffect, useRef, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { WeekDaysHeader } from "./calendar/WeekDaysHeader";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { usePautaStatus } from "./hooks/usePautaStatus";
import { PautaStatusIndicator } from "./PautaStatusIndicator";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { useMonthNavigation } from "./hooks/useMonthNavigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, LayoutGrid, Rows } from "lucide-react";
import { WeekView } from "./calendar/WeekView";
import { DayView } from "./calendar/DayView";
import { useQueryClient } from "@tanstack/react-query";
import "./styles/index.css";

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  selectedCollaborator?: string | null;
  onManualRefetch?: () => void;
}

export function ContentCalendar({ 
  events, 
  clientId, 
  month, 
  year, 
  onMonthChange,
  selectedCollaborator,
  onManualRefetch
}: ContentCalendarProps) {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const lastRefetchTimeRef = useRef<number>(0);
  const queryClient = useQueryClient();
  
  const { 
    selectedDate, 
    selectedEvent, 
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect, 
    handleEventClick,
    setSelectedDate,
    setSelectedEvent
  } = useDateSelection();
  
  const { handlePrevMonth, handleNextMonth } = useMonthNavigation(month, year, onMonthChange);
  
  const currentDate = new Date(year, month - 1, 1);
  
  const { currentEvents } = useCalendarEvents(events, selectedDate, isDialogOpen, setIsDialogOpen, selectedCollaborator);

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // Função aprimorada para forçar atualização
  const forceRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefetchTimeRef.current < 500) {
      console.log("Ignorando refetch muito próximo do anterior");
      return;
    }
    
    lastRefetchTimeRef.current = now;
    console.log("Forçando atualização do calendário");
    
    // Invalidar consultas
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Atualizar timestamp para forçar re-renderização
    setLastRefreshTime(now);
    
    // Chamar callback de atualização manual se existir
    if (onManualRefetch) {
      console.log("Executando atualização manual dos dados");
      onManualRefetch();
      
      // Chamadas adicionais com atraso para garantir atualização completa
      setTimeout(() => onManualRefetch(), 200);
      setTimeout(() => onManualRefetch(), 500);
      setTimeout(() => onManualRefetch(), 1000);
    }
  }, [queryClient, onManualRefetch]);
  
  const handleDialogClose = useCallback(() => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
    
    // Força atualização quando o diálogo é fechado
    forceRefresh();
  }, [setSelectedDate, setSelectedEvent, setIsDialogOpen, forceRefresh]);

  const handleViewChange = useCallback((value: string) => {
    if (value === "month" || value === "week" || value === "day") {
      setView(value as "month" | "week" | "day");
    }
  }, []);
  
  // Efeito para verificar alterações nos eventos e forçar atualização
  useEffect(() => {
    console.log(`Calendar - Displaying ${events.length} events for ${month}/${year}`);
  }, [events, month, year, lastRefreshTime]);

  return (
    <div className="bg-white rounded-md border shadow-sm w-full h-full">
      <div className="px-4 pt-4">
        <PautaStatusIndicator 
          events={events} 
          clientId={clientId} 
          month={month} 
          year={year} 
        />
      </div>
      
      <div className="flex justify-between items-center p-4 border-b">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        
        <ToggleGroup type="single" value={view} onValueChange={handleViewChange} className="ml-auto">
          <ToggleGroupItem value="month" aria-label="Visualização por mês">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="sr-md:inline hidden">Mês</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="week" aria-label="Visualização por semana">
            <Rows className="h-4 w-4 mr-1" />
            <span className="sr-md:inline hidden">Semana</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="day" aria-label="Visualização por dia">
            <LayoutGrid className="h-4 w-4 mr-1" />
            <span className="sr-md:inline hidden">Dia</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {view === "month" && (
        <>
          <WeekDaysHeader weekDays={weekDays} />
          
          <CalendarContainer
            key={`calendar-container-${lastRefreshTime}`}
            events={events}
            selectedDate={selectedDate}
            currentDate={currentDate}
            selectedCollaborator={selectedCollaborator}
            onSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onManualRefetch={forceRefresh}
          />
        </>
      )}
      
      {view === "week" && (
        <WeekView
          key={`week-view-${lastRefreshTime}`}
          events={events}
          selectedDate={selectedDate}
          currentDate={currentDate}
          selectedCollaborator={selectedCollaborator}
          onSelect={handleDateSelect}
          onEventClick={handleEventClick}
          weekDays={weekDays}
        />
      )}
      
      {view === "day" && (
        <DayView
          key={`day-view-${lastRefreshTime}`}
          events={events}
          selectedDate={selectedDate || currentDate}
          currentDate={currentDate}
          selectedCollaborator={selectedCollaborator}
          onSelect={handleDateSelect}
          onEventClick={handleEventClick}
        />
      )}
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clientId={clientId}
          selectedDate={selectedDate}
          events={currentEvents}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={forceRefresh} 
        />
      )}
    </div>
  );
}
