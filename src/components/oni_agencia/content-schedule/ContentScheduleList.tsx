
import { parseISO } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/exportUtils";
import { EmptyState } from "./event-list/EmptyState";
import { ExportButton } from "./event-list/ExportButton";
import { EventDateSection } from "./event-list/EventDateSection";

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

  // Group events by date
  const groupedEvents = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (selectedCollaborator && event.collaborator_id !== selectedCollaborator) {
      return acc;
    }
    
    const dateKey = event.scheduled_date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(event);
    return acc;
  }, {});
  
  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();
  
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
      const filteredEvents = selectedCollaborator 
        ? events.filter(event => event.collaborator_id === selectedCollaborator)
        : events;
        
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
