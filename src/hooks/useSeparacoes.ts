
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Separacao {
  id: string;
  cliente_codigo: number;
  cliente_nome: string;
  created_at: string;
  quantidade_itens: number;
  status: string;
  updated_at: string;
  valor_total: number;
  separacao_itens: {
    created_at: string;
    descricao: string | null;
    id: string;
    item_codigo: string;
    pedido: string;
    quantidade_pedida: number;
    separacao_id: string;
    valor_total: number;
    valor_unitario: number;
  }[];
  representante_nome?: string;
}

export function useSeparacoes() {
  return useQuery({
    queryKey: ['separacoes'],
    queryFn: async (): Promise<Separacao[]> => {
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
        const uniquePedidos = Array.from(new Set(
          separacoes.flatMap(sep => sep.separacao_itens?.map(item => item.pedido) || [])
        ));

        // Primeiro buscar pedidos
        const { data: pedidosReps } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, REPRESENTANTE')
          .eq('CENTROCUSTO', 'JAB')
          .in('PED_NUMPEDIDO', uniquePedidos);

        if (pedidosReps && pedidosReps.length > 0) {
          // Depois buscar representantes
          const { data: representantes } = await supabase
            .from('BLUEBAY_PESSOA')
            .select('PES_CODIGO, RAZAOSOCIAL')
            .in('PES_CODIGO', pedidosReps.map(p => p.REPRESENTANTE).filter(Boolean));

          // Mapear os representantes para as separações
          return separacoes.map(separacao => {
            const pedido = pedidosReps?.find(p => 
              separacao.separacao_itens?.some(item => item.pedido === p.PED_NUMPEDIDO)
            );
            
            const representante = representantes?.find(r => r.PES_CODIGO === pedido?.REPRESENTANTE);
            const representanteNome = representante?.RAZAOSOCIAL || 'Não informado';

            return {
              ...separacao,
              representante_nome: representanteNome
            };
          });
        }
      }

      return separacoes || [];
    }
  });
}
