
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "../types";

export const useUsers = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        // Verificar se o usuário está autenticado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error("Usuário não autenticado");

        // Primeiro, buscar todos os usuários do auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        // Buscar todos os perfis existentes
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, email');

        if (profilesError) {
          console.error("Erro ao buscar perfis:", profilesError);
          throw profilesError;
        }

        // Criar um Set com os IDs dos perfis existentes
        const existingProfileIds = new Set(profiles?.map(p => p.id) || []);

        // Para cada usuário do auth que não tem perfil, criar um
        for (const authUser of (authUsers?.users || [])) {
          if (!existingProfileIds.has(authUser.id)) {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: authUser.id,
                email: authUser.email,
              });

            if (insertError) {
              console.error("Erro ao criar perfil para usuário:", insertError);
              // Continuar mesmo se houver erro, para não bloquear todo o processo
            }
          }
        }

        // Buscar novamente todos os perfis após possíveis inserções
        const { data: finalProfiles, error: finalError } = await supabase
          .from('user_profiles')
          .select('id, email');

        if (finalError) {
          console.error("Erro ao buscar perfis finais:", finalError);
          throw finalError;
        }

        return (finalProfiles || []).map(user => ({
          id: user.id,
          email: user.email || ''
        })) as User[];

      } catch (error: any) {
        console.error("Erro na query de usuários:", error);
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    },
  });
};
