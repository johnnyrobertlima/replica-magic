
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventTooltipProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export function EventTooltip({ event, children }: EventTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px] bg-white border shadow-md">
          <div className="text-xs space-y-1">
            <p className="font-bold">{event.title}</p>
            {event.client && <p><strong>Cliente:</strong> {event.client.name}</p>}
            <p><strong>Serviço:</strong> {event.service?.name}</p>
            {event.product && <p><strong>Produto:</strong> {event.product.name}</p>}
            {event.collaborator && <p><strong>Responsável:</strong> {event.collaborator.name}</p>}
            {event.status && <p><strong>Status:</strong> {event.status.name}</p>}
            {event.editorial_line && <p><strong>Linha Editorial:</strong> {event.editorial_line.name}</p>}
            {event.execution_phase && <p><strong>Fase de Execução:</strong> {event.execution_phase}</p>}
            {event.description && (
              <div>
                <strong>Descrição:</strong>
                <p className="mt-1 text-gray-600 italic max-h-[100px] overflow-y-auto">
                  {event.description}
                </p>
              </div>
            )}
            <p><strong>Data:</strong> {format(new Date(event.scheduled_date), 'dd/MM/yyyy')}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
