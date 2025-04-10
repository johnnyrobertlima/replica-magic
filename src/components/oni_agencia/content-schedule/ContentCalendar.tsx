
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
      <div className="flex flex-wrap gap-1 mt-1">
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
      
      <div className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={currentDate}
          className="rounded-md border-none"
          locale={ptBR}
          components={{
            Day: ({ date, ...props }) => {
              return (
                <div className="h-24 w-full">
                  <button 
                    {...props} 
                    className={`h-8 w-8 p-0 font-normal flex items-center justify-center rounded-full ${
                      props.selected ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {format(date, 'd')}
                  </button>
                  {renderEventsDot(date)}
                </div>
              );
            }
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
