
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
        // Initialize with empty array as fallback
        let result = [];
        
        // Only assign if the response is valid
        const response = await getCollaborators();
        if (Array.isArray(response)) {
          result = response;
        }
        
        console.log(`Successfully fetched ${result.length} collaborators:`, result);
        return result;
      } catch (error) {
        console.error("Error fetching collaborators:", error);
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 3,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
