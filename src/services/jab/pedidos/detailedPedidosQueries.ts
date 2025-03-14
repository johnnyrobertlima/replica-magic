
import { supabase } from "../base/supabaseClient";

/**
 * Fetches detailed pedidos by numbers
 */
export async function fetchPedidosDetalhados(numeroPedidos: string[]) {
  if (!numeroPedidos.length) return [];
  
  // Divide em lotes de 100 para não exceder limites de consulta
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < numeroPedidos.length; i += batchSize) {
    batches.push(numeroPedidos.slice(i, i + batchSize));
  }
  
  console.log(`Buscando detalhes em ${batches.length} lotes`);
  
  // Busca cada lote de pedidos
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
        REPRESENTANTE,
        BLUEBAY_ITEM!inner (
          DESCRICAO
        )
      `)
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .in('PED_NUMPEDIDO', batch);

    if (error) {
      console.error('Erro ao buscar detalhes dos pedidos:', error);
      throw error;
    }
    
    if (data) {
      // Flatten the response to include the description directly
      const flattenedData = data.map(pedido => ({
        ...pedido,
        DESCRICAO: pedido.BLUEBAY_ITEM?.DESCRICAO || null,
        // Remove the nested BLUEBAY_ITEM object
        BLUEBAY_ITEM: undefined
      }));
      
      allResults.push(...flattenedData);
    }
  }

  return allResults;
}
