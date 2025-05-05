
import { useMemo, useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/exportUtils";
import { EmptyState } from "./event-list/EmptyState";
import { ExportButton } from "./event-list/ExportButton";
import { parseISO } from "date-fns";
import { VirtualizedEventList } from "./virtualized/VirtualizedEventList";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OptimizedContentScheduleListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export function OptimizedContentScheduleList({ 
  events, 
  clientId,
  selectedCollaborator,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage
}: OptimizedContentScheduleListProps) {
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

  // Filter events based on selectedCollaborator and remove "Publicado" and "Agendado" status events
  const filteredEvents = useMemo(() => {
    // First filter out events with "Publicado" and "Agendado" status
    const withoutExcludedStatuses = events.filter(event => 
      !(event.status?.name === "Publicado") && 
      !(event.status?.name === "Agendado")
    );
    
    if (!selectedCollaborator) return withoutExcludedStatuses;
    
    return withoutExcludedStatuses.filter(event => {
      // Check if the person is a collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if the person is in the creators array
      let isCreator = false;
      
      if (event.creators) {
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                            (typeof event.creators === 'string' ? [event.creators] : []);
        
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      return isCollaborator || isCreator;
    });
  }, [events, selectedCollaborator]);
  
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
      
      // Usamos filteredEvents para garantir que exportamos exatamente o que o usuário está vendo
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
  if (filteredEvents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-md border shadow-sm w-full overflow-auto">
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <ExportButton onClick={handleExportToPdf} />
        </div>
        
        <div id="content-schedule-list" className="w-full">
          <VirtualizedEventList
            events={filteredEvents}
            onEventClick={handleEventItemClick}
          />
          
          {hasNextPage && (
            <div className="flex justify-center my-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage?.()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Carregar mais'
                )}
              </Button>
            </div>
          )}
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
