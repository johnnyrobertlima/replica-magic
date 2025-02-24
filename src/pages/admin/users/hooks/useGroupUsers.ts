
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserGroupAssignment } from "../types";

export const useGroupUsers = (groupId: string) => {
  return useQuery({
    queryKey: ["group-users", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data: userGroups, error } = await supabase
        .from("user_groups")
        .select("*, user_id")
        .eq("group_id", groupId);
      
      if (error) throw error;

      // Buscar os emails dos usuários em uma consulta separada
      const userIds = userGroups.map(ug => ug.user_id);
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;

      // Mapear os dados combinando as informações
      return userGroups.map(assignment => {
        const user = users.users.find(u => u.id === assignment.user_id);
        return {
          id: assignment.id,
          user_id: assignment.user_id,
          group_id: assignment.group_id,
          user_email: user?.email || null
        };
      }) as UserGroupAssignment[];
    },
    enabled: !!groupId,
  });
};
