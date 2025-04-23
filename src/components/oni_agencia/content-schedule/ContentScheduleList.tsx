
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

interface ContentScheduleListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
}

export function ContentScheduleList({ 
  events, 
  clientId,
  selectedCollaborator 
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

  // Filter events based on selectedCollaborator (optimized with useMemo)
  const filteredEvents = useMemo(() => {
    if (!selectedCollaborator) return events;
    
    return events.filter(event => {
      // Check if the person is a collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if the person is in the creators array - direct ID check
      let isCreator = false;
      
      if (event.creators) {
        // Ensure creators is always treated as an array of strings
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                            (typeof event.creators === 'string' ? [event.creators] : []);
        
        // Direct ID check
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      // Add debug logging for better visibility
      if (event.title === "teste" || event.title === " ") {
        console.log("ContentScheduleList filtering:", {
          eventTitle: event.title,
          collaborator_id: event.collaborator_id,
          creators: event.creators,
          selectedCollaborator,
          isCollaborator,
          isCreator,
          shouldShow: isCollaborator || isCreator
        });
      }
      
      // Return true if the person is either a collaborator or a creator
      return isCollaborator || isCreator;
    });
  }, [events, selectedCollaborator]);
  
  // Group events by date (optimized with useMemo)
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
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
    const date = parseISO(event.scheduled_date);
    handleEventClick(event, date);
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
      
      // Exportar PDF somente com os dados dos agendamentos em paisagem
      exportToPdf({
        filename: `${clientName}_cronograma_conteudo.pdf`,
        content: null,
        orientation: 'landscape', // Explicitly set to landscape
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
  if (sortedDates.length === 0) {
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
              events={groupedEvents[dateString]}
              onEventClick={handleEventItemClick}
            />
          ))}
        </div>
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
        />
      )}
    </div>
  );
}
