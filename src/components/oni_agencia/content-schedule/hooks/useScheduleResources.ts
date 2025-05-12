
import { useServices, useCollaborators } from "@/hooks/oni_agencia/useBasicResources";
import { useOniAgenciaThemes } from "@/hooks/useOniAgenciaThemes";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useQueryClient } from "@tanstack/react-query";

export function useScheduleResources(clientId: string) {
  const queryClient = useQueryClient();
  
  // Basic resources
  const { 
    data: services = [], 
    isLoading: isLoadingServices, 
    isError: isServicesError, 
    refetch: refetchServices 
  } = useServices();
  
  const { 
    data: collaborators = [], 
    isLoading: isLoadingCollaborators, 
    isError: isCollaboratorsError, 
    refetch: refetchCollaborators 
  } = useCollaborators();
  
  // Get the data from useOniAgenciaThemes hook
  const { 
    editorialLines,
    isLoadingEditorialLines,
    isErrorEditorialLines,
    products,
    isLoadingProducts,
    isErrorProducts,
    statuses,
    isLoadingStatuses,
    isErrorStatuses
  } = useOniAgenciaThemes();
  
  // Clients data
  const { 
    data: clients = [], 
    isLoading: isLoadingClients, 
    refetch: refetchClients 
  } = useClients();

  // Function to manually refetch theme-related data
  const refetchThemes = () => {
    queryClient.invalidateQueries({ queryKey: ['editorialLines'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['statuses'] });
  };

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
    refetchAllResources,
    refetchThemes
  };
}
