
import { useServices, useCollaborators } from "@/hooks/oni_agencia/useBasicResources";
import { useOniAgenciaThemes } from "@/hooks/useOniAgenciaThemes";
import { useClients } from "@/hooks/useOniAgenciaClients";

export function useScheduleResources(clientId: string) {
  // Corrigindo para usar os hooks de recursos básicos
  const { data: services = [], isLoading: isLoadingServices, isError: isServicesError, refetch: refetchServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators, isError: isCollaboratorsError, refetch: refetchCollaborators } = useCollaborators();
  
  // Get the data from useOniAgenciaThemes hook
  const { 
    editorialLines,
    isLoadingEditorialLines,
    products,
    isLoadingProducts,
    statuses,
    isLoadingStatuses,
    refetchThemes
  } = useOniAgenciaThemes();
  
  const { data: clients = [], isLoading: isLoadingClients, refetch: refetchClients } = useClients();

  const refetchAllResources = () => {
    console.log("Refetching all schedule resources");
    refetchServices();
    refetchCollaborators();
    refetchThemes();
    refetchClients();
  };

  return {
    services,
    collaborators,
    editorialLines,
    products,
    statuses,
    clients,
    isLoadingServices,
    isServicesError,
    isLoadingCollaborators,
    isCollaboratorsError,
    isLoadingEditorialLines,
    isLoadingProducts,
    isLoadingStatuses,
    isLoadingClients,
    refetchAllResources
  };
}
