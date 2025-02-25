
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserGroupAssignment } from "../types";

type UserGroupJoinResult = {
  id: string;
  user_id: string;
  group_id: string;
  user_profiles: {
    email: string;
  } | null;
}

export const useGroupUsers = (groupId: string) => {
  return useQuery({
    queryKey: ["group-users", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from("user_groups")
        .select(`
          id,
          user_id,
          group_id,
          user_profiles (
            email
          )
        `)
        .eq("group_id", groupId);
      
      if (error) throw error;
      if (!data) return [];

      // First cast to unknown, then to our expected type
      const userGroups = data as unknown as UserGroupJoinResult[];

      return userGroups.map(group => ({
        id: group.id,
        user_id: group.user_id,
        group_id: group.group_id,
        user_email: group.user_profiles?.email || null
      }));
    },
    enabled: !!groupId,
  });
};
