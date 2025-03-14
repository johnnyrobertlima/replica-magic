
import { supabase } from "../base/supabaseClient";

/**
 * Fetches all direct pedidos by date range
 */
export async function fetchAllPedidosDireto(dataInicial: string, dataFinal: string) {
  console.log(`Buscando todos os pedidos diretos para período: ${dataInicial} até ${dataFinal}`);
  
  // Divide a consulta em lotes para evitar timeouts
  const batchSize = 500;
  let lastId = '';
  let allResults: any[] = [];
  let hasMore = true;
  let batchCount = 0;
  
  while (hasMore) {
    batchCount++;
    const query = supabase
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
      .gte('DATA_PEDIDO', `${dataInicial}`)
      .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`);
    
    // Aplicar paginação baseada no ID se não for a primeira consulta
    if (lastId) {
      query.gt('PED_NUMPEDIDO', lastId);
    }
    
    // Ordenar e limitar
    const { data, error } = await query
      .order('PED_NUMPEDIDO', { ascending: true })
      .limit(batchSize);
    
    if (error) {
      console.error('Erro ao buscar pedidos diretos:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      allResults = [...allResults, ...data];
      lastId = data[data.length - 1].PED_NUMPEDIDO;
      
      // Verificar se ainda há mais dados
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }
  
  console.log(`Encontrados ${allResults.length} registros de pedidos diretamente em ${batchCount} lotes`);
  return allResults;
}
