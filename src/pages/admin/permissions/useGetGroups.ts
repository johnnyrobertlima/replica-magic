
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Group } from "./types";

export const useGetGroups = () => {
  return useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      try {
        // Tentar obter a sessão do usuário atual
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Nenhuma sessão de usuário encontrada");
        }

        // Verificar se o usuário é admin
        const { data: isAdmin, error: adminError } = await supabase.rpc(
          'check_admin_permission',
          { check_user_id: sessionData.session.user.id }
        );

        if (adminError) {
          throw adminError;
        }

        if (!isAdmin) {
          throw new Error("Somente administradores podem ver grupos");
        }

        // Se o usuário é admin, buscar grupos diretamente
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('name');

        if (error) {
          if (error.code === '42P17') {
            // Se for o erro de recursão, tentar um método alternativo
            console.log("Tentando método alternativo devido à recursão RLS");
            
            // Método alternativo: usar auth.uid() em vez de auth.jwt()
            const { data: directData, error: directError } = await supabase
              .from("groups")
              .select("id, name, description, homepage")
              .order("name");
            
            if (directError) throw directError;
            return directData as Group[];
          }
          
          throw error;
        }

        return data as Group[];
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        throw error;
      }
    }
  });
};
