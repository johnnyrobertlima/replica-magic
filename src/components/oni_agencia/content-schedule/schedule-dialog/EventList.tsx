
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/types/oni-agencia";

interface EventListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateNew: () => void;
  clientId?: string;
}

export function EventList({ events, onSelectEvent, onCreateNew, clientId }: EventListProps) {
  if (events.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-4">
      <div className="font-medium mb-2">Selecionar agendamento existente</div>
      <div className="grid gap-2 mt-2">
        {events.map(event => (
          <Button
            key={event.id}
            variant="outline"
            className="justify-start h-auto py-2 px-3 text-left"
            style={{ borderLeftColor: event.service?.color, borderLeftWidth: '4px' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEvent(event);
            }}
          >
            <div>
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">{event.service?.name}</div>
            </div>
          </Button>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={(e) => {
          e.stopPropagation();
          console.log("Criar Novo button clicked");
          onCreateNew();
        }}>Criar Novo</Button>
      </div>
    </div>
  );
}
