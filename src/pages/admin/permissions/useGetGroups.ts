
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Group } from "./types";

export const useGetGroups = () => {
  return useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      try {
        // Try to get the current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("No user session found");
        }

        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc(
          'check_admin_permission',
          { check_user_id: sessionData.session.user.id }
        );

        if (adminError) {
          throw adminError;
        }

        if (!isAdmin) {
          throw new Error("Only administrators can view groups");
        }

        // If user is admin, fetch groups directly
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('name');

        if (error) {
          console.error("Error fetching groups:", error);
          
          // Try an alternative method - using a direct query with less filtering
          const { data: directData, error: directError } = await supabase
            .from("groups")
            .select("id, name, description, homepage")
            .order("name");
          
          if (directError) throw directError;
          return directData as Group[];
        }

        return data as Group[];
      } catch (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
    }
  });
};
