
import { supabase } from "@/integrations/supabase/client";
import { Separacao } from "@/types/separacao";

export const fetchSeparacoes = async (): Promise<Separacao[]> => {
  const { data: separacoes, error } = await supabase
    .from('separacoes')
    .select(`
      *,
      separacao_itens (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // If we have separations, fetch representative information
  if (separacoes) {
    const uniquePedidos = Array.from(new Set(
      separacoes.flatMap(sep => sep.separacao_itens?.map(item => item.pedido) || [])
    ));

    // First fetch orders to get representative codes
    const { data: pedidosReps } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('PED_NUMPEDIDO, REPRESENTANTE')
      .eq('CENTROCUSTO', 'JAB')
      .in('PED_NUMPEDIDO', uniquePedidos);

    if (pedidosReps && pedidosReps.length > 0) {
      // Then fetch representatives info
      const { data: representantes } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, RAZAOSOCIAL')
        .in('PES_CODIGO', pedidosReps.map(p => p.REPRESENTANTE).filter(Boolean));

      // Map representatives to separations
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
};
