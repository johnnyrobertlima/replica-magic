
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
    // Get the pedido data first
    const { data: pedidosData, error: pedidosError } = await supabase
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
        QTDE_ENTREGUE, // Este é o campo que está sendo consultado da tabela BLUEBAY_PEDIDO
        DATA_PEDIDO,
        REPRESENTANTE
      `)
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .in('PED_NUMPEDIDO', batch);

    if (pedidosError) {
      console.error('Erro ao buscar detalhes dos pedidos:', pedidosError);
      throw pedidosError;
    }
    
    if (pedidosData) {
      // Now for each item, get the description from BLUEBAY_ITEM
      const itemCodes = pedidosData
        .map(pedido => pedido.ITEM_CODIGO)
        .filter(Boolean);
      
      // Create a map of item codes to descriptions
      const itemDescriptions: Record<string, string> = {};
      
      if (itemCodes.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO, DESCRICAO')
          .in('ITEM_CODIGO', itemCodes);
          
        if (itemsError) {
          console.error('Erro ao buscar descrições dos itens:', itemsError);
        } else if (itemsData) {
          itemsData.forEach(item => {
            if (item.ITEM_CODIGO) {
              itemDescriptions[item.ITEM_CODIGO] = item.DESCRICAO || '';
            }
          });
        }
      }
      
      // Merge the data
      const mergedData = pedidosData.map(pedido => ({
        ...pedido,
        DESCRICAO: pedido.ITEM_CODIGO ? itemDescriptions[pedido.ITEM_CODIGO] || null : null
      }));
      
      allResults.push(...mergedData);
    }
  }

  return allResults;
}
