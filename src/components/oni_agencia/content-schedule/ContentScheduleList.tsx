
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
    // Filter by collaborator if needed
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
  
  // Function to display formatted date header
  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Early return if no events match filters
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
        {sortedDates.map((dateString) => (
          <div key={dateString} className="mb-6">
            <h3 className="text-lg font-semibold text-primary mb-2 capitalize">
              {formatDateHeader(dateString)}
            </h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Linha Editorial</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Status</TableHead>
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
                      <p className="truncate">
                        {event.description || "—"}
                      </p>
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
                    <TableCell>{event.collaborator?.name || "—"}</TableCell>
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
