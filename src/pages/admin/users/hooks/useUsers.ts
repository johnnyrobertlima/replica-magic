
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

        // Buscar todos os perfis
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, email');

        if (profilesError) {
          console.error("Erro ao buscar perfis:", profilesError);
          throw profilesError;
        }

        return (profiles || []).map(user => ({
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
