
import { useServices, useCollaborators } from "@/hooks/oni_agencia/useBasicResources";
import { useOniAgenciaThemes } from "@/hooks/useOniAgenciaThemes";
import { useClients } from "@/hooks/useOniAgenciaClients";

export function useScheduleResources(clientId: string) {
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { 
    data: editorialLines = [], 
    isLoading: isLoadingEditorialLines,
    data: products = [],
    isLoading: isLoadingProducts,
    data: statuses = [],
    isLoading: isLoadingStatuses
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
