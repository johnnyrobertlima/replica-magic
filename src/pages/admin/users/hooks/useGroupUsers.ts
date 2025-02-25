
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserGroupAssignment } from "../types";

interface UserGroupJoinResult {
  id: string;
  user_id: string;
  group_id: string;
  profiles: {
    email: string | null;
  } | null;
}

export const useGroupUsers = (groupId: string) => {
  return useQuery({
    queryKey: ["group-users", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data: userGroups, error: groupError } = await supabase
        .from("user_groups")
        .select(`
          id,
          user_id,
          group_id,
          profiles:user_profiles(email)
        `)
        .eq("group_id", groupId);
      
      if (groupError) throw groupError;
      if (!userGroups) return [];

      return userGroups.map(group => ({
        id: group.id,
        user_id: group.user_id,
        group_id: group.group_id,
        user_email: group.profiles?.email || null
      }));
    },
    enabled: !!groupId,
  });
};
