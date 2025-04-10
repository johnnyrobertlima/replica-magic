
import { useServiceCounts } from "./hooks/useServiceCounts";
import { CalendarEvent } from "@/types/oni-agencia";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiceCountBadgesProps {
  events: CalendarEvent[];
}

export function ServiceCountBadges({ events }: ServiceCountBadgesProps) {
  const serviceCounts = useServiceCounts(events);
  
  if (serviceCounts.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 ml-4">
      <TooltipProvider>
        {serviceCounts.map((service) => (
          <Tooltip key={service.name}>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center rounded-full px-2 py-1 text-xs font-medium"
                style={{ 
                  backgroundColor: `${service.color}20`, 
                  borderLeft: `3px solid ${service.color}` 
                }}
              >
                <span className="mr-1">{service.name}:</span>
                <span className="font-bold">{service.count}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{service.count} evento(s) de {service.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
