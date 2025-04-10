
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, isSameDay, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useAllContentSchedules, useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { WeekDaysHeader } from "./calendar/WeekDaysHeader";
import { CalendarDayCell } from "./calendar/CalendarDayCell";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { useAuthentication } from "@/hooks/auth/useAuthentication";
import { supabase } from "@/integrations/supabase/client";

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  selectedCollaborator?: string | null;
}

export function ContentCalendar({ 
  events, 
  clientId, 
  month, 
  year, 
  onMonthChange,
  selectedCollaborator
}: ContentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [userName, setUserName] = useState<string>("Usuário");
  const { toast } = useToast();
  const { loading } = useAuthentication();
  const updateMutation = useUpdateContentSchedule();
  
  // Use this query to get ALL events regardless of month - this helps when switching months
  const { data: allEvents = [] } = useAllContentSchedules(clientId);
  
  const currentDate = new Date(year, month - 1, 1);
  
  // Use the custom hook to manage calendar events
  const { 
    currentEvents, 
    isDialogOpen, 
    setIsDialogOpen, 
    openDialog 
  } = useCalendarEvents(events, selectedDate);
  
  // Get current user info
  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email || "Usuário");
      }
    };
    
    getUserInfo();
  }, []);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedEvent(undefined); // Clear event selection when selecting a date
    if (date) {
      openDialog();
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleEventClick = (event: CalendarEvent, date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    
    // If not dropped on a valid day cell
    if (!over) return;
    
    const eventId = active.id as string;
    const targetDate = over.id as string;
    
    // Find the event being dragged
    const draggedEvent = events.find(event => event.id === eventId);
    if (!draggedEvent) return;
    
    // Verify target is a valid date
    if (!targetDate.match(/^\d{4}-\d{2}-\d{2}$/)) return;
    
    // Skip if date is the same
    if (draggedEvent.scheduled_date === targetDate) return;
    
    // User info for the action log
    const currentDateFormatted = format(new Date(), "dd/MM/yyyy HH:mm");
    
    // Prepare description with action log
    let updatedDescription = draggedEvent.description || '';
    const actionLog = `\n\nMovido por ${userName} em ${currentDateFormatted} de ${draggedEvent.scheduled_date} para ${targetDate}`;
    updatedDescription += actionLog;
    
    // Update the event with new date and description
    updateMutation.mutateAsync({
      id: draggedEvent.id,
      schedule: {
        scheduled_date: targetDate,
        description: updatedDescription
      }
    }).then(() => {
      toast({
        title: "Agendamento movido",
        description: `O agendamento foi movido para ${format(parseISO(targetDate), "dd/MM/yyyy")}.`,
      });
    }).catch(error => {
      toast({
        title: "Erro ao mover agendamento",
        description: "Ocorreu um erro ao mover o agendamento.",
        variant: "destructive",
      });
    });
  };

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white rounded-md border shadow-sm w-full h-full">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        
        <WeekDaysHeader weekDays={weekDays} />
        
        <div className="w-full p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentDate}
            className="w-full rounded-md border-none"
            locale={ptBR}
            components={{
              Day: ({ date, ...dayProps }) => {
                // Check if this date is selected
                const isSelected = selectedDate && isSameDay(selectedDate, date);
                // Check if this is the current day
                const isCurrentDay = isToday(date);
                // Format date string for event filtering
                const dateString = format(date, 'yyyy-MM-dd');
                
                return (
                  <CalendarDayCell 
                    date={date}
                    events={events}
                    isSelected={isSelected}
                    isCurrentDay={isCurrentDay}
                    onSelect={() => handleDateSelect(date)}
                    onEventClick={(event) => handleEventClick(event, date)}
                    selectedCollaborator={selectedCollaborator}
                  />
                );
              },
              Caption: () => null, // Hide the default caption since we have a custom header
            }}
          />
        </div>
        
        {selectedDate && (
          <ScheduleEventDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            clientId={clientId}
            selectedDate={selectedDate}
            events={currentEvents}
            onClose={() => setSelectedDate(undefined)}
            selectedEvent={selectedEvent} // Pass the selected event to open directly
          />
        )}
      </div>
    </DndContext>
  );
}
