
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

interface UserGroupWithProfile {
  user_id: string;
  user_profiles: {
    email: string | null;
  } | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          user_id,
          user_profiles (
            email
          )
        `);

      if (error) throw error;

      const typedData = data as unknown as UserGroupWithProfile[];
      const uniqueUsers = new Set<string>();
      const users: User[] = [];

      typedData.forEach(item => {
        if (item.user_profiles?.email && !uniqueUsers.has(item.user_id)) {
          uniqueUsers.add(item.user_id);
          users.push({
            id: item.user_id,
            email: item.user_profiles.email
          });
        }
      });

      return users;
    },
  });
};
