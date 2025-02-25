
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserGroupAssignment } from "../types";

export const useGroupUsers = (groupId: string) => {
  return useQuery({
    queryKey: ["group-users", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      // First, get all user groups for this group
      const { data: userGroups, error: groupError } = await supabase
        .from("user_groups")
        .select("*, user_profiles(email)")
        .eq("group_id", groupId);
      
      if (groupError) throw groupError;
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
