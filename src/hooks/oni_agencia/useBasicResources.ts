
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/oniAgenciaServices";
import { getCollaborators } from "@/services/oniAgenciaCollaboratorServices";

const MINUTE = 60 * 1000;
const CACHE_TIME = 60 * MINUTE;

export function useServices() {
  return useQuery({
    queryKey: ['oniAgenciaServices'],
    queryFn: getServices,
    staleTime: CACHE_TIME * 2,
    gcTime: CACHE_TIME * 3,
    retry: 1,
  });
}

export function useCollaborators() {
  return useQuery({
    queryKey: ['oniAgenciaCollaborators'],
    queryFn: getCollaborators,
    staleTime: CACHE_TIME * 2,
    gcTime: CACHE_TIME * 3,
    retry: 1,
  });
}
