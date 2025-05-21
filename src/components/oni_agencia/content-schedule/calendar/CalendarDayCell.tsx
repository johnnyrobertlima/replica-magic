
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarEvent } from '@/types/oni-agencia';

interface CalendarDayCellProps {
  date: Date;
  events: CalendarEvent[];
  isSelected: boolean;
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  useCaptureDate?: boolean;
}

export function CalendarDayCell({
  date,
  events,
  isSelected,
  onDayClick,
  onEventClick,
  useCaptureDate = false
}: CalendarDayCellProps) {
  // Format events for display - ensuring there are no duplicates
  const uniqueEvents = events.reduce((unique: CalendarEvent[], event) => {
    const exists = unique.some(e => e.id === event.id);
    if (!exists) {
      unique.push(event);
    }
    return unique;
  }, []);

  console.log(`CalendarDay ${format(date, 'yyyy-MM-dd')} has ${uniqueEvents.length} events after filtering`);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`h-9 w-9 p-0 font-normal ${isSelected ? 'bg-primary/10' : 'text-muted-foreground'}`}
          onClick={(e) => {
            // Prevent default to avoid triggering popover on specific clicks
            if (!isSelected) {
              console.log("Day clicked in calendar:", date);
              e.preventDefault();
              e.stopPropagation();
              onDayClick(date);
            }
          }}
        >
          <div className="w-full h-full relative">
            {format(date, "d")}
            {uniqueEvents.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute bottom-1 right-1 rounded-sm px-1 py-0 text-[10px]"
              >
                {uniqueEvents.length}
              </Badge>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {uniqueEvents.length > 0 ? (
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">
              {format(date, 'dd/MM/yyyy')}
              {useCaptureDate && <span className="ml-1 text-xs">(Capturas)</span>}
            </h3>
            {uniqueEvents.map((event) => (
              <Button
                key={event.id}
                variant="outline"
                className="justify-start h-auto py-2 px-3 text-left"
                style={{ borderLeftColor: event.service?.color || '#666', borderLeftWidth: '4px' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Event clicked in popover:", event.id);
                  onEventClick(event, date);
                }}
              >
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground">{event.service?.name}</div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">
              {format(date, 'dd/MM/yyyy')}
              {useCaptureDate && <span className="ml-1 text-xs">(Capturas)</span>}
            </h3>
            <p className="text-sm text-muted-foreground">Nenhum agendamento para este dia.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDayClick(date);
              }}
            >
              Adicionar {useCaptureDate ? "captura" : "agendamento"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
