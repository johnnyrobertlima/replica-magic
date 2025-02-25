
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Buscar todos os usuários através da view existente
      const { data: users, error } = await supabase
        .from('user_groups_with_profiles')
        .select('user_id, user_email');

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw error;
      }

      console.log("Usuários encontrados (antes da deduplição):", users);

      // Remover duplicatas usando Set
      const uniqueUsers = Array.from(
        new Map(
          users?.map(user => [user.user_id, user])
        ).values()
      );

      console.log("Usuários únicos:", uniqueUsers);

      // Mapear os dados para o formato esperado
      return (uniqueUsers || []).map(user => ({
        id: user.user_id,
        email: user.user_email || ''
      })) as User[];
    },
  });
};
