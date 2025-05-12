
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/oniAgenciaServices";
import { getCollaborators } from "@/services/oniAgenciaCollaboratorServices";

const MINUTE = 60 * 1000;
const CACHE_TIME = 60 * MINUTE;

export function useServices() {
  return useQuery({
    queryKey: ['oniAgenciaServices'],
    queryFn: async () => {
      try {
        return await getServices();
      } catch (error) {
        console.error("Error fetching services:", error);
        throw error;
      }
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 3,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCollaborators() {
  return useQuery({
    queryKey: ['oniAgenciaCollaborators'],
    queryFn: async () => {
      try {
        console.log("Fetching collaborators...");
        const result = await getCollaborators();
        console.log(`Successfully fetched ${result.length} collaborators`);
        return result;
      } catch (error) {
        console.error("Error fetching collaborators:", error);
        throw error;
      }
    },
    staleTime: CACHE_TIME * 2,
    gcTime: CACHE_TIME * 3,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
