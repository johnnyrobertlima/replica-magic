
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Group } from "./types";

export const useGetGroups = () => {
  return useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      try {
        // Verificar se o usuário tem sessão e é administrador
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("No user session found");
        }

        // Verificar se o usuário é administrador usando a função 'check_admin_permission'
        const { data: isAdmin, error: adminError } = await supabase.rpc(
          'check_admin_permission',
          { check_user_id: sessionData.session.user.id }
        );

        if (adminError) {
          console.error("Error checking admin permission:", adminError);
          throw adminError;
        }

        if (!isAdmin) {
          throw new Error("Only administrators can view groups");
        }

        // Usar a nova função SECURITY DEFINER para buscar grupos
        const { data, error } = await supabase.rpc('get_all_groups');

        if (error) {
          console.error("Error fetching groups with RPC:", error);
          
          // Fallback: Se a função RPC falhar, tentar consulta direta
          console.log("Trying alternative approach to fetch groups...");
          
          const { data: directData, error: directError } = await supabase
            .from("groups")
            .select("id, name, description, homepage")
            .order("name");
            
          if (directError) {
            console.error("Error with direct query:", directError);
            throw directError;
          }
          
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
