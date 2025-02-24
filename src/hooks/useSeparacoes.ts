
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSeparacoes() {
  return useQuery({
    queryKey: ['separacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('separacoes')
        .select(`
          *,
          separacao_itens (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}
