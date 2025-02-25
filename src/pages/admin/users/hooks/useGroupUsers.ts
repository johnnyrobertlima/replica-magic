
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
        .select(`
          id,
          user_id,
          group_id,
          user_profiles!inner (
            email
          )
        `)
        .eq("group_id", groupId);
      
      if (error) throw error;
      if (!userGroups) return [];

      return userGroups.map(group => ({
        id: group.id,
        user_id: group.user_id,
        group_id: group.group_id,
        user_email: group.user_profiles?.email || null
      })) as UserGroupAssignment[];
    },
    enabled: !!groupId,
  });
};
