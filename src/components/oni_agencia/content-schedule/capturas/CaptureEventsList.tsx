
import React from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Plus } from "lucide-react";

interface CaptureEventsListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
  onManualRefetch: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onDialogStateChange?: (open: boolean) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CaptureEventsList({
  events,
  clientId,
  selectedCollaborator,
  onManualRefetch,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onDialogStateChange,
  onEventClick
}: CaptureEventsListProps) {
  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    if (!event.capture_date) return acc;
    
    const dateStr = event.capture_date.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  // Handle new capture button click
  const handleNewCapture = () => {
    // This would typically open a dialog to create a new capture
    if (onDialogStateChange) {
      onDialogStateChange(true);
    }
  };
  
  // Format time from ISO string
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button 
          onClick={handleNewCapture}
          className="flex items-center gap-2"
          disabled={!clientId}
        >
          <Plus size={16} />
          Nova Captura
        </Button>
      </div>
      
      {sortedDates.length === 0 ? (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-center">Nenhuma captura encontrada</CardTitle>
            <CardDescription className="text-center">
              Selecione um cliente e adicione uma nova captura
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        sortedDates.map(dateStr => (
          <div key={dateStr} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventsByDate[dateStr].map(event => (
                <Card 
                  key={event.id} 
                  className="bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onEventClick(event)}
                >
                  <CardHeader 
                    className="pb-2"
                    style={{ 
                      borderBottom: `3px solid ${event.service?.color || '#666'}` 
                    }}
                  >
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {event.service?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    {event.capture_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {event.is_all_day ? 
                            "Dia todo" : 
                            `${formatTime(event.capture_date)} - ${event.capture_end_date ? formatTime(event.capture_end_date) : 'Sem horário de fim'}`
                          }
                        </span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.collaborator && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {event.collaborator.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
      
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
  );
}
