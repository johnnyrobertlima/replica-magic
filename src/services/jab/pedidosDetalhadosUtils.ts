
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches detailed information for the given order numbers
 */
export async function fetchPedidosDetalhados(numeroPedidos: string[]) {
  if (!numeroPedidos.length) return [];
  
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < numeroPedidos.length; i += batchSize) {
    batches.push(numeroPedidos.slice(i, i + batchSize));
  }
  
  console.log(`Buscando detalhes em ${batches.length} lotes`);
  
  const allResults = [];
  for (const batch of batches) {
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select(`
        MATRIZ,
        FILIAL,
        PED_NUMPEDIDO,
        PED_ANOBASE,
        QTDE_SALDO,
        VALOR_UNITARIO,
        PES_CODIGO,
        PEDIDO_CLIENTE,
        STATUS,
        ITEM_CODIGO,
        QTDE_PEDIDA,
        QTDE_ENTREGUE,
        DATA_PEDIDO,
        REPRESENTANTE
      `)
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .in('PED_NUMPEDIDO', batch);

    if (error) {
      console.error('Erro ao buscar detalhes dos pedidos:', error);
      throw error;
    }
    
    if (data) {
      allResults.push(...data);
    }
  }

  return allResults;
}
