
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, parse, startOfMonth, getDay, addDays, eachDayOfInterval, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScheduleEventDialog } from "./ScheduleEventDialog";

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
  
  const currentDate = new Date(year, month - 1, 1);
  
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const eventsOnDay = events.filter(event => event.scheduled_date === dateString);
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

  const renderEventsDot = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter(event => event.scheduled_date === dateString);
    
    return dayEvents.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-1 overflow-y-auto max-h-20">
        {dayEvents.map((event, index) => (
          <div
            key={event.id}
            className="w-full p-1 text-xs truncate rounded"
            style={{ backgroundColor: event.service.color, color: '#fff' }}
            title={event.title}
          >
            {event.title}
          </div>
        ))}
      </div>
    ) : null;
  };

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <div className="bg-white rounded-md border shadow-sm">
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
              // This ensures we correctly check if this date is selected
              const isSelected = selectedDate && 
                selectedDate.getDate() === date.getDate() && 
                selectedDate.getMonth() === date.getMonth() && 
                selectedDate.getFullYear() === date.getFullYear();
              
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
                  {renderEventsDot(date)}
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
