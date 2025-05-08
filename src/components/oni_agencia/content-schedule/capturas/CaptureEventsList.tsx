
import { useCallback, useMemo } from "react";
import { parseISO, format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { ScheduleEventDialog } from "../ScheduleEventDialog";
import { useDateSelection } from "../hooks/useDateSelection";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/exportUtils";
import { EventDateSection } from "../event-list/EventDateSection";
import { ExportButton } from "../event-list/ExportButton";
import { EmptyState } from "../event-list/EmptyState";
import { Button } from "@/components/ui/button";

interface CaptureEventsListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
  onManualRefetch?: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function CaptureEventsList({ 
  events, 
  clientId,
  selectedCollaborator,
  onManualRefetch,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: CaptureEventsListProps) {
  const { toast } = useToast();
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

  // Group events by capture_date (optimized with useMemo)
  const groupedEvents = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      if (event.capture_date) {
        // Use only the date part of capture_date for grouping
        const datePart = event.capture_date.split('T')[0];
        if (!acc[datePart]) {
          acc[datePart] = [];
        }
        
        acc[datePart].push(event);
      }
      return acc;
    }, {});
  }, [events]);
  
  // Sort dates
  const sortedDates = useMemo(() => 
    Object.keys(groupedEvents).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    ), 
    [groupedEvents]
  );
  
  const handleEventItemClick = useCallback((event: CalendarEvent) => {
    // For capture events, we use the capture date instead of scheduled date
    const date = event.capture_date ? parseISO(event.capture_date) : parseISO(event.scheduled_date);
    handleEventClick(event, date);
  }, [handleEventClick]);
  
  const handleDialogClose = useCallback(() => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  }, [setSelectedDate, setSelectedEvent, setIsDialogOpen]);

  // Handle PDF export
  const handleExportToPdf = useCallback(() => {
    try {
      exportToPdf({
        filename: `Agenda_capturas.pdf`,
        content: null,
        orientation: 'landscape', 
        data: events,
      });
      
      toast({
        title: "Exportação iniciada",
        description: "O PDF está sendo gerado e será baixado em breve.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível exportar a agenda para PDF.",
      });
    }
  }, [events, toast]);

  // Show empty state if no events
  if (sortedDates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-md border shadow-sm w-full overflow-auto">
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <ExportButton onClick={handleExportToPdf} />
        </div>
        
        <div id="capture-schedule-list">
          {sortedDates.map((dateString) => (
            <div key={dateString} className="mb-8">
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">
                {format(new Date(dateString), "dd 'de' MMMM 'de' yyyy")}
              </h3>
              
              <div className="grid gap-2">
                {groupedEvents[dateString].map(event => {
                  let timeInfo = "";
                  if (event.capture_date) {
                    if (event.is_all_day) {
                      timeInfo = "Dia inteiro";
                    } else if (event.capture_end_date) {
                      timeInfo = `${format(new Date(event.capture_date), "HH:mm")} - ${format(new Date(event.capture_end_date), "HH:mm")}`;
                    } else {
                      timeInfo = format(new Date(event.capture_date), "HH:mm");
                    }
                  }
                  
                  return (
                    <div 
                      key={event.id} 
                      onClick={() => handleEventItemClick(event)}
                      className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderLeftColor: event.service?.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">{event.service?.name}</div>
                          {event.location && (
                            <div className="text-xs text-gray-500">Local: {event.location}</div>
                          )}
                        </div>
                        <div className="text-sm font-medium">{timeInfo}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {hasNextPage && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
            </Button>
          </div>
        )}
      </div>
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clientId={clientId}
          selectedDate={selectedDate}
          events={[]}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
          defaultTab="capture"
        />
      )}
    </div>
  );
}
