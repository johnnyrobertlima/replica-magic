
import { useServices, useCollaborators } from "@/hooks/useOniAgenciaContentSchedules";
import { useOniAgenciaThemes } from "@/hooks/useOniAgenciaThemes";
import { useClients } from "@/hooks/useOniAgenciaClients";

export function useScheduleResources(clientId: string) {
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  
  // Get the data from useOniAgenciaThemes hook
  const { 
    editorialLines,
    isLoadingEditorialLines,
    products,
    isLoadingProducts,
    statuses,
    isLoadingStatuses
  } = useOniAgenciaThemes();
  
  const { data: clients = [], isLoading: isLoadingClients } = useClients();

  return {
    services,
    collaborators,
    editorialLines,
    products,
    statuses,
    clients,
    isLoadingServices,
    isLoadingCollaborators,
    isLoadingEditorialLines,
    isLoadingProducts,
    isLoadingStatuses,
    isLoadingClients
  };
}
