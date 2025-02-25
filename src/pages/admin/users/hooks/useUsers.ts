
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Buscar todos os usuários da tabela user_profiles
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, email');

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw error;
      }

      console.log("Usuários encontrados:", users);

      // Mapear os dados para o formato esperado
      return (users || []).map(user => ({
        id: user.id,
        email: user.email || ''
      })) as User[];
    },
  });
};
