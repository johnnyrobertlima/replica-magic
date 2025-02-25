
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Buscar diretamente da tabela user_profiles ao invés de user_groups
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email
        `);

      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || ''
      })) as User[];
    },
  });
};
