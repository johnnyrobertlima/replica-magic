
import { supabase } from '../base/supabaseClient';

/**
 * Fetches detailed information for a list of order numbers
 */
export async function fetchPedidosDetalhados(
  numeroPedidos: string[],
  centrocusto: string = 'JAB'
) {
  try {
    console.log(`Buscando detalhes para ${numeroPedidos.length} pedidos`);
    
    // Para lidar com muitos pedidos, dividimos em lotes para evitar timeouts
    const batchSize = 200;
    let allResults: any[] = [];
    
    // Processar em lotes - executando em paralelo para melhor desempenho
    const batches = [];
    for (let i = 0; i < numeroPedidos.length; i += batchSize) {
      const batch = numeroPedidos.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    const batchPromises = batches.map(async (batch) => {
      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .eq('CENTROCUSTO', centrocusto)
        .in('PED_NUMPEDIDO', batch)
        .in('STATUS', ['1', '2']);

      if (error) {
        console.error(`Erro ao buscar lote de pedidos detalhados:`, error);
        return [];
      }
      
      return data || [];
    });
    
    // Executar todas as consultas em paralelo
    const batchResults = await Promise.all(batchPromises);
    
    // Combinar todos os resultados
    batchResults.forEach(result => {
      allResults = [...allResults, ...result];
    });

    console.log(`Encontrados ${allResults.length} registros detalhados no total`);
    return allResults;
  } catch (error) {
    console.error('Exceção ao buscar pedidos detalhados:', error);
    return [];
  }
}
