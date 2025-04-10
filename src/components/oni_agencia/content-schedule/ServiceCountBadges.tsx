
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useServiceCounts } from "./hooks/useServiceCounts";
import { CalendarEvent } from "@/types/oni-agencia";
import { useClientScopesByClient } from "@/hooks/useOniAgenciaClientScopes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiceCountBadgesProps {
  events: CalendarEvent[];
  clientId?: string;
  month?: number;
  year?: number;
}

export function ServiceCountBadges({ events, clientId, month, year }: ServiceCountBadgesProps) {
  const serviceCounts = useServiceCounts(events);
  const { data: clientScopes = [] } = useClientScopesByClient(clientId || null);
  const [scopeCountMap, setScopeCountMap] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Build a map of service ID to contracted quantity from client scopes
    const scopeMap: Record<string, number> = {};
    
    if (clientScopes && clientScopes.length > 0) {
      clientScopes.forEach((scope) => {
        scopeMap[scope.service_id] = scope.quantity;
      });
    }
    
    setScopeCountMap(scopeMap);
  }, [clientScopes]);
  
  if (serviceCounts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center ml-4">
      <TooltipProvider>
        {serviceCounts.map((service) => {
          const contractedAmount = scopeCountMap[service.id] || 0;
          const scheduledAmount = service.count;
          const remaining = Math.max(0, contractedAmount - scheduledAmount);
          
          // Determine the badge color based on scheduled vs contracted
          let badgeClass = "bg-gray-100 text-gray-800 hover:bg-gray-200";
          
          if (contractedAmount > 0) {
            if (scheduledAmount > contractedAmount) {
              // Exceeded contracted amount
              badgeClass = "bg-amber-100 text-amber-800 hover:bg-amber-200";
            } else if (scheduledAmount === contractedAmount) {
              // Exactly at contracted amount
              badgeClass = "bg-green-100 text-green-800 hover:bg-green-200";
            } else {
              // Still has remaining
              badgeClass = "bg-blue-100 text-blue-800 hover:bg-blue-200";
            }
          }
          
          return (
            <Tooltip key={service.id}>
              <TooltipTrigger asChild>
                <Badge 
                  className={`${badgeClass} cursor-help py-1 px-2 font-medium text-xs`}
                  style={{ backgroundColor: service.color, color: '#fff' }}
                >
                  {service.name}: {contractedAmount > 0 ? 
                    `${scheduledAmount}/${contractedAmount} (${remaining} restantes)` : 
                    scheduledAmount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {contractedAmount > 0 ? 
                    `${service.name}: ${scheduledAmount} agendados de ${contractedAmount} contratados. ${remaining} restantes para agendar.` : 
                    `${service.name}: ${scheduledAmount} agendados (sem escopo definido)`}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
