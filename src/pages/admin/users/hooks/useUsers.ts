
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .throwOnError();

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw error;
      }

      console.log("Perfis de usuários encontrados:", profiles);

      return (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || ''
      })) as User[];
    },
  });
};
