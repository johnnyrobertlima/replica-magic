
import { supabase } from "@/integrations/supabase/client";
import type { PedidosPorClienteResult } from "../types";

/**
 * Fetches orders grouped by client for the specified date range
 * Uses the optimized database function
 */
export async function fetchPedidosPorCliente(dataInicial: string, dataFinal: string) {
  console.log('Buscando pedidos agrupados por cliente para o período:', { dataInicial, dataFinal });
  
  try {
    // Ensure we include time in the dataFinal to capture the entire day
    const dataFinalCompleta = `${dataFinal} 23:59:59.999`;
    console.log(`Data inicial formatada: ${dataInicial}, Data final formatada: ${dataFinalCompleta}`);
    
    // Execute the RPC call with debugging info
    const startTime = Date.now();
    console.log(`Starting RPC call to get_pedidos_por_cliente at ${new Date().toISOString()}`);
    
    const { data, error } = await supabase.rpc('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: dataFinalCompleta
    }, {
      head: false, // Não use HEAD request para evitar timeout em resultados grandes
      count: 'exact' // Get exact count of rows
    }) as { data: PedidosPorClienteResult[] | null, error: any };

    const endTime = Date.now();
    console.log(`RPC call completed in ${endTime - startTime}ms`);

    if (error) {
      console.error('Erro ao buscar pedidos por cliente:', error);
      throw error;
    }
    
    // Verificando número total de registros retornados 
    console.log(`Total de clientes retornados da função get_pedidos_por_cliente: ${data?.length || 0}`);
    
    // Contando número total de pedidos para verificação
    let totalPedidosDistintosBanco = 0;
    data?.forEach(cliente => {
      if (cliente.total_pedidos_distintos) {
        totalPedidosDistintosBanco += cliente.total_pedidos_distintos;
      }
    });
    
    console.log(`Total de pedidos distintos do banco: ${totalPedidosDistintosBanco}`);
    
    // Log complete client list with their order counts
    if (data && data.length > 0) {
      // Ordenar por nome para facilitar a leitura
      const sortedData = [...data].sort((a, b) => {
        return (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
      });
      
      console.log("=== LISTA COMPLETA DE CLIENTES E PEDIDOS ===");
      sortedData.forEach(cliente => {
        console.log(`${cliente.cliente_nome || 'SEM NOME'} (${cliente.pes_codigo}): ${cliente.total_pedidos_distintos || 0} pedidos`);
      });
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar pedidos por cliente:', error);
    throw error;
  }
}
