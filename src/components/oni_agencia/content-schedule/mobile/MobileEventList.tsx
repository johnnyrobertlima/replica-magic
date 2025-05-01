
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/oni-agencia";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "../status-badge/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface MobileEventListProps {
  groupedEvents: Record<string, CalendarEvent[]>;
  sortedDates: string[];
  onEventClick: (event: CalendarEvent) => void;
}

export function MobileEventList({ 
  groupedEvents, 
  sortedDates,
  onEventClick 
}: MobileEventListProps) {
  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      {sortedDates.map((dateString) => (
        <div key={dateString} className="mb-4">
          <h3 className="text-base font-semibold text-primary mb-2 capitalize">
            {formatDateHeader(dateString)}
          </h3>
          
          <div className="space-y-2">
            {groupedEvents[dateString].map((event) => (
              <Card 
                key={event.id}
                className="overflow-hidden"
                onClick={() => onEventClick(event)}
              >
                <div 
                  className="h-1.5 w-full" 
                  style={{ backgroundColor: event.service?.color }}
                />
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{event.title || "Sem título"}</span>
                    {/* Display client name in the status badge position */}
                    {event.client?.name ? (
                      <StatusBadge color={event.status?.color || "#9CA3AF"} className="text-xs px-1.5 py-0.5">
                        {event.client.name}
                      </StatusBadge>
                    ) : (
                      <StatusBadge color={event.status?.color || "#9CA3AF"} className="text-xs px-1.5 py-0.5">
                        {event.status?.name || "Pendente"}
                      </StatusBadge>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <span className="mr-2">{event.service?.name}</span>
                    {event.editorial_line && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{event.editorial_line.name}</span>
                      </>
                    )}
                  </div>
                  
                  {event.description && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="description" className="border-none">
                        <AccordionTrigger className="py-1 text-xs">
                          Descrição
                        </AccordionTrigger>
                        <AccordionContent className="text-xs">
                          {event.description}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  
                  {event.collaborator && (
                    <div className="flex items-center mt-2">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage 
                          src={event.collaborator.photo_url || ''} 
                          alt={event.collaborator.name} 
                        />
                        <AvatarFallback className="text-[10px]">
                          {event.collaborator.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{event.collaborator.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
