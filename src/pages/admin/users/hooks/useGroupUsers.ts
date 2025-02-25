
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
          created_at,
          profiles:user_profiles!user_id(email)
        `)
        .eq("group_id", groupId);
      
      if (error) throw error;

      return (userGroups || []).map(assignment => ({
        id: assignment.id,
        user_id: assignment.user_id,
        group_id: assignment.group_id,
        user_email: assignment.profiles?.email || null
      })) as UserGroupAssignment[];
    },
    enabled: !!groupId,
  });
};
