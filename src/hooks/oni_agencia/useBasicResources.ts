
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
        const services = await getServices();
        // Ensure we always return an array
        return Array.isArray(services) ? services : [];
      } catch (error) {
        console.error("Error fetching services:", error);
        return []; // Return empty array instead of throwing
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
        // Log the fetch attempt for debugging
        console.log("Fetching collaborators from useCollaborators hook");
        
        // Get collaborators from service
        const response = await getCollaborators();
        
        // Force array type and handle undefined response
        if (!response) {
          console.warn("Collaborators response was undefined or null");
          return [];
        }
        
        // Ensure response is always an array
        const safeResponse = Array.isArray(response) ? response : [];
        console.log(`Received ${safeResponse.length} collaborators before validation`);
        
        // Filter out any invalid collaborator entries
        const validCollaborators = safeResponse.filter(item => 
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
        // Return empty array to prevent UI errors
        return [];
      }
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 3,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
