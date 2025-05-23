
import { useEffect, useMemo } from "react";
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { CalendarEvent } from "@/types/oni-agencia";
import { HistoryTimeline } from "./HistoryTimeline";
import { useQueryClient } from "@tanstack/react-query";
import { useServices, useCollaborators } from "@/hooks/oni_agencia/useBasicResources";
import { useOniAgenciaThemes } from "@/hooks/useOniAgenciaThemes";
import { useClients } from "@/hooks/useOniAgenciaClients";

interface ScheduleHistoryProps {
  event: CalendarEvent;
}

export function ScheduleHistory({ event }: ScheduleHistoryProps) {
  const queryClient = useQueryClient();
  const { data: history = [], isLoading, isError, error, refetch } = useScheduleHistory(event.id);

  // Fetch related data for mapping IDs to names
  const { data: services = [] } = useServices();
  const { data: collaborators = [] } = useCollaborators();
  const { editorialLines = [], products = [], statuses = [] } = useOniAgenciaThemes();
  const { data: clients = [] } = useClients();

  // Create mapping objects for IDs to readable names
  const idMappings = useMemo(() => {
    return {
      'client_id': clients.reduce((acc, client) => {
        acc[client.id] = client.name;
        return acc;
      }, {} as Record<string, string>),
      
      'service_id': services.reduce((acc, service) => {
        acc[service.id] = service.name;
        return acc;
      }, {} as Record<string, string>),
      
      'collaborator_id': collaborators.reduce((acc, collab) => {
        acc[collab.id] = collab.name;
        return acc;
      }, {} as Record<string, string>),
      
      'editorial_line_id': editorialLines.reduce((acc, line) => {
        acc[line.id] = line.name;
        return acc;
      }, {} as Record<string, string>),
      
      'product_id': products.reduce((acc, product) => {
        acc[product.id] = product.name;
        return acc;
      }, {} as Record<string, string>),
      
      'status_id': statuses.reduce((acc, status) => {
        acc[status.id] = status.name;
        return acc;
      }, {} as Record<string, string>)
    };
  }, [services, collaborators, editorialLines, products, statuses, clients]);

  // Refetch history data whenever event changes or description is updated
  useEffect(() => {
    if (event && event.id) {
      console.log("ScheduleHistory: Refetching history for event", event.id);
      
      // Force refetch with a small delay to ensure data is committed
      const timeoutId = setTimeout(() => {
        console.log("ScheduleHistory: Invalidating and refetching history cache");
        queryClient.invalidateQueries({ queryKey: ['scheduleHistory', event.id] });
        refetch();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [event, event?.id, event?.description, event?.updated_at, refetch, queryClient]);

  const handleRefetchResources = () => {
    console.log("ScheduleHistory: Manual refetch triggered");
    // Invalidate the cache specifically for this event's history
    queryClient.invalidateQueries({ queryKey: ['scheduleHistory', event.id] });
    refetch();
  };

  return (
    <HistoryTimeline 
      historyData={history} 
      isLoading={isLoading} 
      isError={isError} 
      error={error}
      onRefetchResources={handleRefetchResources}
      itemMappings={idMappings}
    />
  );
}
