
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserGroupAssignment } from "../types";

type UserGroupViewResult = {
  id: string;
  user_id: string;
  group_id: string;
  user_email: string | null;
}

export const useGroupUsers = (groupId: string) => {
  return useQuery({
    queryKey: ["group-users", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from("user_groups_with_profiles")
        .select()
        .eq("group_id", groupId);
      
      if (error) throw error;
      if (!data) return [];

      const userGroups = data as UserGroupViewResult[];

      return userGroups.map(group => ({
        id: group.id,
        user_id: group.user_id,
        group_id: group.group_id,
        user_email: group.user_email || null
      }));
    },
    enabled: !!groupId,
  });
};
