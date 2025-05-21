
import { useState, useCallback, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { DayProps } from "react-day-picker";

interface ContentCalendarProps {
  events: CalendarEvent[];
  month: number;
  year: number;
  clientId: string;
  onMonthYearChange: (month: number, year: number) => void;
  isCollapsed?: boolean;
  onManualRefetch?: () => void;
  useCaptureDate?: boolean;
  selectedCollaborator?: string | null;
  defaultTab?: "details" | "status" | "capture" | "history";
  prioritizeCaptureDate?: boolean;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent, date: Date) => void;
}

export function ContentCalendar({
  events,
  month,
  year,
  clientId,
  onMonthYearChange,
  isCollapsed = false,
  onManualRefetch,
  useCaptureDate = false,
  selectedCollaborator = null,
  defaultTab = "details",
  prioritizeCaptureDate = false,
  onDateSelect,
  onEventClick
}: ContentCalendarProps) {
  const [date, setDate] = useState(new Date(year, month - 1, 1));
  const {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect: handleInternalDateSelect,
    handleEventClick: handleInternalEventClick,
    setSelectedDate: setSelectedDateContext,
    setSelectedEvent: setSelectedEventContext,
    openDialog,
    closeDialog
  } = useDateSelection();

  // Log when dialog state changes for debugging
  useEffect(() => {
    console.log("Dialog state changed:", isDialogOpen);
  }, [isDialogOpen]);

  // Handler for date selection - call both internal handler and prop handler if provided
  const handleDateSelectCombined = useCallback((date: Date) => {
    console.log("Date selected in ContentCalendar:", format(date, 'yyyy-MM-dd'));
    handleInternalDateSelect(date);
    
    // Call the prop handler if provided
    if (onDateSelect) {
      onDateSelect(date);
    }
  }, [handleInternalDateSelect, onDateSelect]);

  // Handler for event click - call both internal handler and prop handler if provided
  const handleEventClickCombined = useCallback((event: CalendarEvent, date: Date) => {
    console.log("Event clicked in ContentCalendar:", event.id, event.title);
    handleInternalEventClick(event, date);
    
    // Call the prop handler if provided
    if (onEventClick) {
      onEventClick(event, date);
    }
  }, [handleInternalEventClick, onEventClick]);

  const handleDialogClose = () => {
    console.log("Closing dialog in ContentCalendar");
    setSelectedDateContext(undefined);
    setSelectedEventContext(undefined);
    closeDialog();
  };

  // Modified to consider the useCaptureDate option
  const getDayEvents = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (useCaptureDate) {
        // If using capture date, filter by it
        return events.filter((event) => {
          if (!event.capture_date) return false;
          
          // Extract only the date (without the hour) from capture_date
          const captureDateOnly = event.capture_date.split('T')[0];
          return captureDateOnly === dateStr;
        });
      } else {
        // Original behavior - filter by scheduled_date
        return events.filter((event) => event.scheduled_date === dateStr);
      }
    },
    [events, useCaptureDate]
  );

  // Custom day cell renderer function - updated to use DayProps correctly
  const renderDayContents = (dayProps: DayProps) => {
    const { date } = dayProps;
    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
    const dayEvents = getDayEvents(date);
    const hasEvents = dayEvents && dayEvents.length > 0;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 font-normal text-muted-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isSelected) {
                console.log("Day clicked in calendar:", date);
                handleDateSelectCombined(date);
              }
            }}
          >
            <div className="w-full h-full relative">
              {format(date, "d")}
              {hasEvents && (
                <Badge
                  variant="secondary"
                  className="absolute bottom-1 right-1 rounded-sm px-1.5 py-0 text-xs"
                >
                  {dayEvents.length}
                </Badge>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          {hasEvents ? (
            <div className="grid gap-2">
              {dayEvents.map((event) => (
                <Button
                  key={event.id}
                  variant="outline"
                  className="justify-start h-auto py-2 px-3 text-left"
                  style={{ borderLeftColor: event.service?.color, borderLeftWidth: '4px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Event clicked in popover:", event.id);
                    handleEventClickCombined(event, date);
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
              <p className="text-sm text-muted-foreground">Nenhum agendamento para este dia.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDateSelectCombined(date);
                }}
              >
                Adicionar agendamento
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  };

  // Add diagnostic logs to monitor dialog state
  useEffect(() => {
    if (selectedDate) {
      console.log("Selected date set in ContentCalendar:", selectedDate);
      console.log("Dialog open state:", isDialogOpen);
    }
  }, [selectedDate, isDialogOpen]);

  return (
    <div className="rounded-md border bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newMonth = date.getMonth() - 1;
              const newYear = date.getFullYear();
              setDate(new Date(newYear, newMonth, 1));
              onMonthYearChange(newMonth + 1, newYear);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newMonth = date.getMonth() + 1;
              const newYear = date.getFullYear();
              setDate(new Date(newYear, newMonth, 1));
              onMonthYearChange(newMonth + 1, newYear);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(date, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>
      </div>
      <Calendar
        mode="single"
        locale={ptBR}
        selected={selectedDate}
        onSelect={(newDate) => {
          if (newDate) {
            console.log("Calendar onSelect called with date:", newDate);
            handleDateSelectCombined(newDate);
            setDate(newDate);
          }
        }}
        initialFocus
        pagedNavigation
        defaultMonth={date}
        className="border-none m-4 pointer-events-auto"
        captionLayout="buttons"
        components={{
          Day: renderDayContents
        }}
      />
      
      {/* Only show the dialog if external handlers are not provided */}
      {selectedDate && !onDateSelect && !onEventClick && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            console.log("Dialog open state changing to:", open);
            // Only update if the state is actually changing
            if (isDialogOpen !== open) {
              if (open) {
                openDialog();
              } else {
                closeDialog();
              }
            }
          }}
          clientId={clientId}
          selectedDate={selectedDate}
          events={[]}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
          defaultTab={defaultTab}
          prioritizeCaptureDate={prioritizeCaptureDate}
        />
      )}
    </div>
  );
}
