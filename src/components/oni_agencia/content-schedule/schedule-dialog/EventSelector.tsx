
import React from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface EventSelectorProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateNew: () => void;
}

export function EventSelector({ events, onSelectEvent, onCreateNew }: EventSelectorProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        {events.length > 0 ? (
          events.map((event) => (
            <Button
              key={event.id}
              variant="outline"
              className="w-full justify-start h-auto py-2 px-3 text-left"
              style={{ 
                borderLeftColor: event.service?.color || '#cbd5e1', 
                borderLeftWidth: '4px' 
              }}
              onClick={() => onSelectEvent(event)}
            >
              <div>
                <div className="font-medium">{event.title || "Sem título"}</div>
                <div className="text-sm text-muted-foreground">{event.service?.name || "Serviço não especificado"}</div>
              </div>
            </Button>
          ))
        ) : (
          <div className="text-center p-4">
            <p>Nenhum evento encontrado para esta data.</p>
          </div>
        )}
      </div>
      
      <div className="text-center border-t pt-4">
        <Button
          variant="default"
          onClick={() => {
            console.log("Criar novo button clicked, resetting form");
            onCreateNew();
          }}
          className="w-full"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Criar novo agendamento
        </Button>
      </div>
    </div>
  );
}
