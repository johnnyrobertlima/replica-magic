
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, parse, startOfMonth, getDay, addDays, eachDayOfInterval, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useAllContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

export function ContentCalendar({ events, clientId, month, year, onMonthChange }: ContentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use this query to get ALL events regardless of month - this helps when switching months
  const { data: allEvents = [] } = useAllContentSchedules(clientId);
  
  const currentDate = new Date(year, month - 1, 1);
  
  useEffect(() => {
    console.log("All events from database:", allEvents);
    console.log("Events for current month:", events);
  }, [allEvents, events]);
  
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log("Looking for events on:", dateString);
      console.log("Available events:", events);
      
      const eventsOnDay = events.filter(event => {
        const eventDate = event.scheduled_date;
        return eventDate === dateString;
      });
      
      console.log("Events found for selected day:", eventsOnDay);
      setCurrentEvents(eventsOnDay);
    } else {
      setCurrentEvents([]);
    }
  }, [selectedDate, events]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsDialogOpen(true);
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

  // New function to render events in a single-line compact format
  const renderCompactEvents = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter(event => event.scheduled_date === dateString);
    
    if (dayEvents.length === 0) return null;
    
    return (
      <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-20">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="w-full h-6 flex items-center text-xs rounded overflow-hidden cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDate(new Date(event.scheduled_date));
              setIsDialogOpen(true);
            }}
          >
            {/* Service color - first part */}
            <div 
              className="h-full w-6 flex-shrink-0" 
              style={{ backgroundColor: event.service.color }}
              title={event.service.name}
            />
            
            {/* Editorial line - second part */}
            {event.editorial_line ? (
              <div 
                className="h-full w-6 flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: event.editorial_line.color || '#E5DEFF' }}
                title={event.editorial_line.name}
              >
                {event.editorial_line.symbol && (
                  <span className="text-white text-[8px] font-bold">
                    {event.editorial_line.symbol}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-full w-6 flex-shrink-0 bg-gray-100" />
            )}
            
            {/* Collaborator photo - third part */}
            <div className="h-full w-6 flex-shrink-0 flex items-center justify-center bg-gray-50">
              {event.collaborator ? (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={event.collaborator.photo_url || ''} alt={event.collaborator.name} />
                  <AvatarFallback className="text-[8px]">
                    {event.collaborator.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-200" />
              )}
            </div>
            
            {/* Status color, Product and Title - fourth part (70%) */}
            <div 
              className="h-full flex-grow flex items-center overflow-hidden"
              style={{ 
                backgroundColor: event.status?.color || '#F1F0FB',
                color: event.status?.color ? '#fff' : '#000'
              }}
            >
              <div className="px-1 truncate">
                {event.product ? (
                  <span className="font-semibold">{event.product.name}:</span>
                ) : null}
                {' '}
                <span className="truncate">{event.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <div className="bg-white rounded-md border shadow-sm w-full h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            title="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            title="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 w-full border-b">
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className="text-center py-2 font-medium text-sm border-r last:border-r-0 bg-gray-100"
          >
            {day}
          </div>
        ))}
      </div>
      
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
              
              return (
                <div className="h-32 w-full border-r border-b cursor-pointer hover:bg-gray-50" onClick={() => handleDateSelect(date)}>
                  <button 
                    {...dayProps} 
                    className={`h-8 w-8 p-0 font-normal flex items-center justify-center rounded-full ${
                      isSelected ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {format(date, 'd')}
                  </button>
                  {renderCompactEvents(date)}
                </div>
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
        />
      )}
    </div>
  );
}
