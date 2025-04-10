
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useServiceCounts } from "./hooks/useServiceCounts";
import { CalendarEvent } from "@/types/oni-agencia";
import { useClientScopesByClient } from "@/hooks/useOniAgenciaClientScopes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";

interface ServiceCountBadgesProps {
  events: CalendarEvent[];
  clientId?: string;
  month?: number;
  year?: number;
}

export function ServiceCountBadges({ events, clientId, month, year }: ServiceCountBadgesProps) {
  const serviceCounts = useServiceCounts(events);
  const { data: clientScopes = [] } = useClientScopesByClient(clientId || null);
  const { data: allServices = [] } = useServices();
  const [scopeCountMap, setScopeCountMap] = useState<Record<string, number>>({});
  const [allServiceItems, setAllServiceItems] = useState<Array<{
    id: string;
    count: number;
    name: string;
    color: string;
    contracted: number;
  }>>([]);
  
  useEffect(() => {
    // Build a map of service ID to contracted quantity from client scopes
    const scopeMap: Record<string, number> = {};
    
    if (clientScopes && clientScopes.length > 0) {
      clientScopes.forEach((scope) => {
        scopeMap[scope.service_id] = scope.quantity;
      });
    }
    
    setScopeCountMap(scopeMap);
    
    // Combine scheduled services with contracted but unscheduled services
    const serviceMap: Record<string, {
      id: string;
      count: number;
      name: string;
      color: string;
      contracted: number;
    }> = {};
    
    // First, add all scheduled services
    serviceCounts.forEach((service) => {
      serviceMap[service.id] = {
        ...service,
        contracted: scopeMap[service.id] || 0
      };
    });
    
    // Then, add all contracted services that aren't scheduled yet
    if (clientScopes && clientScopes.length > 0 && allServices && allServices.length > 0) {
      clientScopes.forEach((scope) => {
        if (!serviceMap[scope.service_id]) {
          // Find the service details from allServices
          const serviceDetails = allServices.find(service => service.id === scope.service_id);
          if (serviceDetails) {
            serviceMap[scope.service_id] = {
              id: scope.service_id,
              count: 0, // Not scheduled yet
              name: serviceDetails.name,
              color: serviceDetails.color,
              contracted: scope.quantity
            };
          }
        }
      });
    }
    
    // Sort by name for consistency
    const sortedServices = Object.values(serviceMap).sort((a, b) => {
      // First sort by whether they have any contracted amounts (those with contracts come first)
      if (a.contracted > 0 && b.contracted === 0) return -1;
      if (a.contracted === 0 && b.contracted > 0) return 1;
      
      // Then sort by count (highest first)
      if (a.count !== b.count) return b.count - a.count;
      
      // Finally sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    setAllServiceItems(sortedServices);
  }, [clientScopes, serviceCounts, allServices]);
  
  if (allServiceItems.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center ml-4">
      <TooltipProvider>
        {allServiceItems.map((service) => {
          const contractedAmount = service.contracted;
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
