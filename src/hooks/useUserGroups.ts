
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user belongs to specific groups
 * @param targetGroups Array of group names to check against
 * @returns Object containing loading state and whether user is in any of the specified groups
 */
export function useUserGroups(targetGroups: string[] = []) {
  const [isInGroups, setIsInGroups] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkUserGroups() {
      try {
        setIsLoading(true);
        
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsInGroups(false);
          setIsLoading(false);
          return;
        }
        
        // Check if user belongs to any of the target groups using the DB function
        const results = await Promise.all(
          targetGroups.map(async (groupName) => {
            const { data, error } = await supabase.rpc('check_user_in_group', {
              user_id: user.id,
              group_name: groupName
            });
            
            if (error) {
              console.error(`Error checking group ${groupName}:`, error);
              return false;
            }
            
            return !!data;
          })
        );
        
        // User is in target groups if any of the checks returned true
        setIsInGroups(results.some(result => result));
      } catch (error) {
        console.error("Error checking user groups:", error);
        setIsInGroups(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkUserGroups();
  }, [targetGroups]);

  return { isInGroups, isLoading };
}
