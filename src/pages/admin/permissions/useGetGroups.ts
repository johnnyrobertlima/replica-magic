
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

        // Verificar se o usuário é administrador
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

        // Usar a função RPC get_all_groups que contorna o problema de RLS
        const { data, error } = await supabase.rpc('get_all_groups');

        if (error) {
          console.error("Error fetching groups with RPC:", error);
          
          // Fallback: Tentar obter dados diretamente da view (se existir)
          // ou usar uma abordagem alternativa que não dependa de RLS nas tabelas relacionadas
          console.log("Trying alternative approach to fetch groups...");
          
          // Verificar primeiro se o usuário tem algum grupo via user_groups
          const { data: userGroups, error: userGroupsError } = await supabase
            .from("user_groups")
            .select("group_id")
            .eq("user_id", sessionData.session.user.id);
            
          if (userGroupsError) {
            console.error("Error fetching user groups:", userGroupsError);
            throw userGroupsError;
          }
          
          if (!userGroups || userGroups.length === 0) {
            return [] as Group[];
          }
          
          // Obter detalhes dos grupos com uma consulta que evita gatilhos de RLS
          const groupIds = userGroups.map(ug => ug.group_id);
          const { data: groupsData, error: groupsError } = await supabase
            .from("groups")
            .select("id, name, description, homepage")
            .in("id", groupIds);
          
          if (groupsError) {
            console.error("Error fetching groups details:", groupsError);
            throw groupsError;
          }
          
          return groupsData as Group[];
        }

        return data as Group[];
      } catch (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
    }
  });
};
