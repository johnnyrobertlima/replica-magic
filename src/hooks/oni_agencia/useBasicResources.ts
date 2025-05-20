
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
        
        // Always return a safe array
        const response = await getCollaborators();
        
        // Ensure we always have a valid array, even if API returns null/undefined
        const result = Array.isArray(response) ? response : [];
        
        // Additional safeguard: ensure all items in the array are valid objects
        const validCollaborators = result.filter(item => 
          item && 
          typeof item === 'object' && 
          item.id && 
          typeof item.id === 'string' &&
          item.name
        );
        
        console.log(`Successfully fetched ${validCollaborators.length} valid collaborators`);
        return validCollaborators;
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
