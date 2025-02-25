
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

interface UserData {
  id: string;
  email: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          user_id,
          users (
            id,
            email
          )
        `);

      if (error) throw error;

      // Transformar os dados e remover duplicatas usando um Set
      const uniqueUsers = new Set<string>();
      const users: User[] = [];

      data?.forEach(item => {
        if (item.users?.email && !uniqueUsers.has(item.user_id)) {
          uniqueUsers.add(item.user_id);
          users.push({
            id: item.user_id,
            email: item.users.email
          });
        }
      });

      return users;
    },
  });
};
