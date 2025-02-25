
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

        console.log("Session:", session);

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
