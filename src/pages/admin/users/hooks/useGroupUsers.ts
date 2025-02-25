
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserGroupAssignment } from "../types";

interface UserGroup {
  id: string;
  user_id: string;
  group_id: string;
  created_at?: string;
  users: {
    email: string;
  } | null;
}

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
          users (
            email
          )
        `)
        .eq("group_id", groupId);
      
      if (error) throw error;

      return (userGroups as UserGroup[]).map(assignment => ({
        id: assignment.id,
        user_id: assignment.user_id,
        group_id: assignment.group_id,
        user_email: assignment.users?.email || null
      })) as UserGroupAssignment[];
    },
    enabled: !!groupId,
  });
};
