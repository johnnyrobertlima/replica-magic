
import { useState } from "react";
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
import "./styles/index.css"; // Updated import

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  selectedCollaborator?: string | null;
  onManualRefetch?: () => void; // Adicionado prop para atualização manual
}

export function ContentCalendar({ 
  events, 
  clientId, 
  month, 
  year, 
  onMonthChange,
  selectedCollaborator,
  onManualRefetch // Recebe a função de atualização manual
}: ContentCalendarProps) {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  
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

  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  };

  const handleViewChange = (value: string) => {
    if (value === "month" || value === "week" || value === "day") {
      setView(value);
    }
  };

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
            events={events}
            selectedDate={selectedDate}
            currentDate={currentDate}
            selectedCollaborator={selectedCollaborator}
            onSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onManualRefetch={onManualRefetch} // Passar a função de atualização manual
          />
        </>
      )}
      
      {view === "week" && (
        <WeekView
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
          onManualRefetch={onManualRefetch} // Passar a função de atualização manual
        />
      )}
    </div>
  );
}
