
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Primeiro, vamos buscar os usuários da auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.error("Erro ao buscar usuários da auth:", authError);
        throw authError;
      }

      console.log("Usuários da auth encontrados:", authUsers);

      // Em seguida, buscar os perfis existentes
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }

      console.log("Perfis existentes:", profiles);

      // Criar um mapa dos perfis existentes
      const profileMap = new Map(
        (profiles || []).map(profile => [profile.id, profile])
      );

      // Combinar os dados dos usuários auth com os perfis
      return authUsers.map(user => ({
        id: user.id,
        email: user.email || '',
        // Usar dados do perfil se existir, caso contrário usar dados do auth
        ...((profileMap.get(user.id)) || {})
      })) as User[];
    },
  });
};
