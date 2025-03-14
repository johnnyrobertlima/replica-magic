
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

  if (error) {
    console.error('Error fetching separacoes:', error);
    throw error;
  }

  console.log(`Fetched ${separacoes?.length || 0} separacoes from database`);
  
  // Log separation status to check if there are pending separations
  if (separacoes && separacoes.length > 0) {
    const statusCounts = separacoes.reduce((acc, sep) => {
      const status = sep.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Separation status counts:', statusCounts);
    console.log('First separation example:', { 
      id: separacoes[0].id,
      status: separacoes[0].status,
      cliente_nome: separacoes[0].cliente_nome,
      valor_total: separacoes[0].valor_total,
      items_count: separacoes[0].separacao_itens?.length || 0
    });
  }

  // If we have separations, fetch representative information
  if (separacoes && separacoes.length > 0) {
    const uniquePedidos = Array.from(new Set(
      separacoes.flatMap(sep => sep.separacao_itens?.map(item => item.pedido) || [])
    ));

    console.log(`Found ${uniquePedidos.length} unique pedidos in separations`);

    // First fetch orders to get representative codes
    const { data: pedidosReps } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('PED_NUMPEDIDO, REPRESENTANTE')
      .eq('CENTROCUSTO', 'JAB')
      .in('PED_NUMPEDIDO', uniquePedidos);

    if (pedidosReps && pedidosReps.length > 0) {
      console.log(`Found ${pedidosReps.length} matching pedidos with representatives`);
      
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
