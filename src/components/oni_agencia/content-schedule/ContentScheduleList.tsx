
import { parseISO } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/exportUtils";
import { EmptyState } from "./event-list/EmptyState";
import { ExportButton } from "./event-list/ExportButton";
import { EventDateSection } from "./event-list/EventDateSection";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface ContentScheduleListProps {
  events: CalendarEvent[];
  clientId?: string;
  selectedCollaborator?: string | null;
  onManualRefetch?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  showLoadingState?: boolean;
}

export function ContentScheduleList({ 
  events = [], 
  clientId = '',
  selectedCollaborator,
  onManualRefetch,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  showLoadingState = false
}: ContentScheduleListProps) {
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

  // Ensure events is an array and filter based on selectedCollaborator
  const filteredEvents = useMemo(() => {
    // Safety check to ensure events is always an array
    if (!Array.isArray(events)) {
      console.warn("Events is not an array:", events);
      return [];
    }
    
    // First filter out events with "Publicado" and "Agendado" status
    const withoutExcludedStatuses = events.filter(event => 
      event && 
      event.status && 
      !(event.status.name === "Publicado") && 
      !(event.status.name === "Agendado")
    );
    
    // If no collaborator is selected, return all events
    if (!selectedCollaborator) return withoutExcludedStatuses;
    
    // Filter events based on the selected collaborator
    return withoutExcludedStatuses.filter(event => {
      if (!event) return false;
      
      // Check if the person is a collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if the person is in the creators array
      let isCreator = false;
      
      if (event.creators) {
        // Safely handle creators which might be string, array, or undefined
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                            (typeof event.creators === 'string' ? [event.creators] : []);
        
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      // Return true if the person is either a collaborator or a creator
      return isCollaborator || isCreator;
    });
  }, [events, selectedCollaborator]);
  
  // Group events by date
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      if (!event?.scheduled_date) return acc;
      
      const dateKey = event.scheduled_date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);
  
  // Sort dates
  const sortedDates = useMemo(() => Object.keys(groupedEvents).sort(), [groupedEvents]);
  
  const handleEventItemClick = (event: CalendarEvent) => {
    if (!event?.scheduled_date) {
      console.error("Cannot handle event click: event has no scheduled_date", event);
      return;
    }
    try {
      const date = parseISO(event.scheduled_date);
      handleEventClick(event, date);
    } catch (error) {
      console.error("Failed to parse scheduled_date:", event.scheduled_date, error);
    }
  };
  
  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  };

  // Handle PDF export
  const handleExportToPdf = () => {
    try {
      const clientName = "Agenda";
      
      exportToPdf({
        filename: `${clientName}_cronograma_conteudo.pdf`,
        content: null,
        orientation: 'landscape', 
        data: filteredEvents,
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
  };

  // Show empty state if no events
  if (!filteredEvents.length || sortedDates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-md border shadow-sm w-full overflow-auto">
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <ExportButton onClick={handleExportToPdf} />
        </div>
        
        <div id="content-schedule-list">
          {sortedDates.map((dateString) => (
            <EventDateSection
              key={dateString}
              dateString={dateString}
              events={groupedEvents[dateString] || []}
              onEventClick={handleEventItemClick}
            />
          ))}
        </div>
        
        {hasNextPage && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Carregando mais..." : "Carregar mais"}
            </Button>
          </div>
        )}
      </div>
      
      {selectedDate && clientId && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clientId={clientId}
          selectedDate={selectedDate}
          events={[]}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
