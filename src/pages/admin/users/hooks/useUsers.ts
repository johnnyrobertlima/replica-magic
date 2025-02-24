
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        return users.map(user => ({
          id: user.id,
          email: user.email || '',
        })) as User[];
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }
    },
  });
};
