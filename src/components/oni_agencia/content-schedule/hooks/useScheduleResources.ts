
import { useServices, useCollaborators } from "@/hooks/oni_agencia/useBasicResources";
import { useEditorialLines } from "@/hooks/useEditorialLines";
import { useProducts } from "@/hooks/useProducts";
import { useStatuses } from "@/hooks/useStatuses";
import { useClients } from "@/hooks/useOniAgenciaClients";

export function useScheduleResources(clientId: string) {
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: editorialLines = [], isLoading: isLoadingEditorialLines } = useEditorialLines();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useStatuses();
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
