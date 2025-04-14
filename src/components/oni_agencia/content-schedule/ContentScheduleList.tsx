
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/oni-agencia";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge/StatusBadge";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/exportUtils";

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
  
  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleExportToPdf = () => {
    try {
      const clientName = "Agenda";
      const filteredEvents = selectedCollaborator 
        ? events.filter(event => event.collaborator_id === selectedCollaborator)
        : events;
        
      // Exportar PDF somente com os dados dos agendamentos
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

  if (sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum agendamento encontrado para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border shadow-sm w-full overflow-auto">
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportToPdf}
            className="flex items-center gap-2"
          >
            <File className="h-4 w-4" />
            <span>Exportar PDF</span>
          </Button>
        </div>
        
        <div id="content-schedule-list">
          {sortedDates.map((dateString) => (
            <div key={dateString} className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-2 capitalize">
                {formatDateHeader(dateString)}
              </h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">Serviço</TableHead>
                    <TableHead className="w-[15%]">Linha Editorial</TableHead>
                    <TableHead className="w-[15%]">Nome</TableHead>
                    <TableHead className="w-[45%]">Descrição</TableHead>
                    <TableHead className="w-[10%]">Colaborador</TableHead>
                    <TableHead className="w-[5%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedEvents[dateString].map((event) => (
                    <TableRow 
                      key={event.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEventItemClick(event)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: event.service.color }}
                          />
                          {event.service.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.editorial_line ? (
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: event.editorial_line.color || '#ccc' }}
                            />
                            {event.editorial_line.name}
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {event.title}
                          {event.product && 
                            <span className="ml-1 text-muted-foreground">
                              - {event.product.name}
                            </span>
                          }
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="whitespace-pre-line">
                          {event.description || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {event.collaborator ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage 
                                src={event.collaborator.photo_url || ''} 
                                alt={event.collaborator.name} 
                              />
                              <AvatarFallback>
                                {event.collaborator.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{event.collaborator.name}</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {event.status ? (
                          <StatusBadge color={event.status.color || "#9CA3AF"}>
                            {event.status.name}
                          </StatusBadge>
                        ) : (
                          <StatusBadge color="#9CA3AF">
                            Pendente
                          </StatusBadge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
