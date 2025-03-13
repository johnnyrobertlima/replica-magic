
import { supabase } from "@/integrations/supabase/client";
import type { PedidosPorClienteResult } from "../types";

/**
 * Fetches orders grouped by client for the specified date range
 * Uses the optimized database function
 */
export async function fetchPedidosPorCliente(dataInicial: string, dataFinal: string) {
  console.log('DIAGNOSTIC LOG: fetchPedidosPorCliente called with:', { dataInicial, dataFinal });
  
  try {
    // Ensure we include time in the dataFinal to capture the entire day
    const dataFinalCompleta = `${dataFinal} 23:59:59.999`;
    console.log(`DIAGNOSTIC LOG: Data inicial formatada: ${dataInicial}, Data final formatada: ${dataFinalCompleta}`);
    
    // Execute the RPC call with debugging info
    const startTime = Date.now();
    console.log(`DIAGNOSTIC LOG: Starting RPC call to get_pedidos_por_cliente at ${new Date().toISOString()}`);
    
    const { data, error } = await supabase.rpc('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: dataFinalCompleta
    }, {
      head: false, // Não use HEAD request para evitar timeout em resultados grandes
      count: 'exact' // Get exact count of rows
    }) as { data: PedidosPorClienteResult[] | null, error: any };

    const endTime = Date.now();
    console.log(`DIAGNOSTIC LOG: RPC call completed in ${endTime - startTime}ms`);

    if (error) {
      console.error('ERROR in fetchPedidosPorCliente:', error);
      console.error('ERROR details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data) {
      console.error('ERROR: No data returned from get_pedidos_por_cliente function!');
      return [];
    }
    
    // Verificando número total de registros retornados 
    console.log(`DIAGNOSTIC LOG: Total de clientes retornados da função get_pedidos_por_cliente: ${data.length || 0}`);
    
    // Contando número total de pedidos para verificação
    let totalPedidosDistintosBanco = 0;
    data.forEach(cliente => {
      if (cliente.total_pedidos_distintos) {
        totalPedidosDistintosBanco += cliente.total_pedidos_distintos;
      }
    });
    
    console.log(`DIAGNOSTIC LOG: Total de pedidos distintos do banco: ${totalPedidosDistintosBanco}`);
    
    // Verify data integrity
    const clientesComProblemas = data.filter(c => !c.cliente_nome || !c.pes_codigo || !c.total_pedidos_distintos);
    if (clientesComProblemas.length > 0) {
      console.warn(`ALERTA: Encontrados ${clientesComProblemas.length} clientes com dados incompletos`);
      clientesComProblemas.slice(0, 5).forEach((c, i) => {
        console.warn(`Problema ${i+1}:`, {
          pes_codigo: c.pes_codigo || 'MISSING',
          cliente_nome: c.cliente_nome || 'MISSING', 
          total_pedidos_distintos: c.total_pedidos_distintos || 'MISSING'
        });
      });
    }
    
    // Log complete client list with their order counts in groups of 50
    if (data && data.length > 0) {
      // Ordenar por nome para facilitar a leitura
      const sortedData = [...data].sort((a, b) => {
        return (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
      });
      
      const chunkSize = 50;
      for (let i = 0; i < sortedData.length; i += chunkSize) {
        const chunk = sortedData.slice(i, i + chunkSize);
        console.log(`=== LISTA DE CLIENTES E PEDIDOS (${i+1} - ${Math.min(i+chunkSize, sortedData.length)}) ===`);
        chunk.forEach((cliente, idx) => {
          console.log(`${i+idx+1}. ${cliente.cliente_nome || 'SEM NOME'} (${cliente.pes_codigo}): ${cliente.total_pedidos_distintos || 0} pedidos`);
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('FATAL ERROR in fetchPedidosPorCliente:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  }
}
