
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Primeiro, vamos buscar os usuários do auth schema
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          user_id
        `)
        .distinct();

      if (error) throw error;

      // Agora vamos buscar os emails desses usuários
      const usersMap = new Map();
      if (data) {
        for (const row of data) {
          const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', row.user_id)
            .single();

          if (userData) {
            usersMap.set(row.user_id, {
              id: row.user_id,
              email: userData.email
            });
          }
        }
      }

      return Array.from(usersMap.values()) as User[];
    },
  });
};
