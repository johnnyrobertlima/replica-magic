
import { supabase } from "@/integrations/supabase/client";
import type { PedidosPorClienteResult, ItensPorClienteResult, EstoqueItemResult } from "./types";

/**
 * Busca os pedidos agrupados por cliente para o período especificado
 * Utiliza a função otimizada no banco de dados
 */
export async function fetchPedidosPorCliente(dataInicial: string, dataFinal: string) {
  console.log('Buscando pedidos agrupados por cliente para o período:', { dataInicial, dataFinal });
  
  try {
    // Ensure we include time in the dataFinal to capture the entire day
    const dataFinalCompleta = `${dataFinal} 23:59:59.999`;
    console.log(`Data inicial formatada: ${dataInicial}, Data final formatada: ${dataFinalCompleta}`);
    
    // Use the correct function name as a string literal for the RPC call
    // For long date ranges, we need to make sure we don't timeout
    const startTime = Date.now();
    console.log(`Starting RPC call to get_pedidos_por_cliente at ${new Date().toISOString()}`);
    
    const { data, error } = await supabase.rpc('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: dataFinalCompleta
    }, { 
      count: 'exact',
      head: false // Don't use head request to avoid timeout issues with large results
    }) as { data: PedidosPorClienteResult[] | null, error: any };

    const endTime = Date.now();
    console.log(`RPC call completed in ${endTime - startTime}ms`);

    if (error) {
      console.error('Erro ao buscar pedidos por cliente:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} clientes com pedidos no período`);
    
    // Log some debugging info for large datasets
    if (data && data.length > 0) {
      // Check for specific clients like "Laguna"
      const laguna = data.find(cliente => 
        cliente.cliente_nome?.toLowerCase().includes('laguna'));
      
      if (laguna) {
        console.log('Cliente Laguna encontrado:', {
          codigo: laguna.pes_codigo,
          nome: laguna.cliente_nome,
          total_quantidade_saldo: laguna.total_quantidade_saldo,
          total_valor_saldo: laguna.total_valor_saldo
        });
      } else {
        console.log('Cliente Laguna não encontrado nos resultados');
      }
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar pedidos por cliente:', error);
    throw error;
  }
}

/**
 * Busca os itens de um cliente específico para o período especificado
 * Utiliza a função otimizada no banco de dados
 */
export async function fetchItensPorCliente(dataInicial: string, dataFinal: string, clienteCodigo: number) {
  console.log('Buscando itens do cliente para o período:', { dataInicial, dataFinal, clienteCodigo });
  
  try {
    // Ensure we include time in the dataFinal to capture the entire day
    const dataFinalCompleta = `${dataFinal} 23:59:59.999`;
    
    // Use the correct function name as a string literal for the RPC call
    const startTime = Date.now();
    console.log(`Starting RPC call to get_itens_por_cliente at ${new Date().toISOString()}`);
    
    const { data, error } = await supabase.rpc('get_itens_por_cliente', {
      data_inicial: dataInicial,
      data_final: dataFinalCompleta,
      cliente_codigo: clienteCodigo
    }, {
      head: false // Don't use head request to avoid timeout issues with large results
    }) as { data: ItensPorClienteResult[] | null, error: any };

    const endTime = Date.now();
    console.log(`RPC call completed in ${endTime - startTime}ms`);

    if (error) {
      console.error('Erro ao buscar itens do cliente:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} itens para o cliente ${clienteCodigo}`);
    
    // For debugging - count unique pedidos for this client
    if (data && data.length > 0) {
      const uniquePedidos = new Set(data.map(item => item.pedido));
      console.log(`Cliente ${clienteCodigo} tem ${uniquePedidos.size} pedidos únicos`);
      console.log('Primeiros 5 números de pedido:', [...uniquePedidos].slice(0, 5));
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar itens do cliente:', error);
    throw error;
  }
}

/**
 * Busca o estoque disponível para os itens especificados
 * Utiliza a função otimizada no banco de dados
 */
export async function fetchEstoqueParaItens(itemCodigos: string[]) {
  if (!itemCodigos.length) return [];
  
  try {
    console.log(`Buscando estoque para ${itemCodigos.length} itens`);
    
    // For large number of items, process in batches to avoid query parameter limitations
    const batchSize = 500; // Most databases have limits on the number of parameters
    const batches = [];
    
    for (let i = 0; i < itemCodigos.length; i += batchSize) {
      batches.push(itemCodigos.slice(i, i + batchSize));
    }
    
    console.log(`Processando consulta de estoque em ${batches.length} lotes`);
    
    let allResults: EstoqueItemResult[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processando lote ${i+1}/${batches.length} com ${batch.length} itens`);
      
      // Use the correct function name as a string literal for the RPC call
      const { data, error } = await supabase.rpc('get_estoque_para_itens', {
        item_codigos: batch
      }) as { data: EstoqueItemResult[] | null, error: any };

      if (error) {
        console.error(`Erro ao buscar estoque para os itens no lote ${i+1}:`, error);
        throw error;
      }
      
      if (data) {
        allResults = [...allResults, ...data];
        console.log(`Lote ${i+1}: Obtidos dados de estoque para ${data.length} itens`);
      }
    }
    
    console.log(`Encontrados dados de estoque para ${allResults.length} itens no total`);
    return allResults;
  } catch (error) {
    console.error('Erro ao buscar estoque para os itens:', error);
    throw error;
  }
}
