
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
        .select("*")
        .eq("group_id", groupId);
      
      if (groupError) throw groupError;
      if (!userGroups) return [];

      // Then, get the user profiles for all users in these groups
      const userIds = userGroups.map(ug => ug.user_id);
      
      const { data: userProfiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, email")
        .in("id", userIds);
      
      if (profileError) throw profileError;
      
      // Map the data together
      return userGroups.map(group => {
        const userProfile = userProfiles?.find(profile => profile.id === group.user_id);
        return {
          id: group.id,
          user_id: group.user_id,
          group_id: group.group_id,
          user_email: userProfile?.email || null
        };
      }) as UserGroupAssignment[];
    },
    enabled: !!groupId,
  });
};
