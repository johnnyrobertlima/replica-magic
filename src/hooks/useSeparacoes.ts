
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSeparacoes() {
  return useQuery({
    queryKey: ['separacoes'],
    queryFn: async () => {
      const { data: separacoes, error } = await supabase
        .from('separacoes')
        .select(`
          *,
          separacao_itens (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar informações dos representantes
      if (separacoes) {
        const { data: pedidosInfo } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, REPRESENTANTE_NOME')
          .in('PED_NUMPEDIDO', separacoes.flatMap(sep => 
            sep.separacao_itens?.map(item => item.pedido) || []
          ));

        // Mapear os representantes para as separações
        return separacoes.map(separacao => {
          const pedidosRepresentantes = pedidosInfo?.filter(p => 
            separacao.separacao_itens?.some(item => item.pedido === p.PED_NUMPEDIDO)
          ) || [];
          
          const representante = pedidosRepresentantes[0]?.REPRESENTANTE_NOME || 'Não informado';

          return {
            ...separacao,
            representante_nome: representante
          };
        });
      }

      return separacoes || [];
    }
  });
}
