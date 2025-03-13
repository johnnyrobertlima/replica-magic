
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
    
    const { data, error, count, status } = await supabase.rpc('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: dataFinalCompleta
    }, {
      head: false, // Não use HEAD request para evitar timeout em resultados grandes
      count: 'exact' // Get exact count of rows
    }) as { data: PedidosPorClienteResult[] | null, error: any, count: number | null, status: number };

    const endTime = Date.now();
    console.log(`DIAGNOSTIC LOG: RPC call completed in ${endTime - startTime}ms with status ${status}`);
    console.log(`DIAGNOSTIC LOG: Count from API: ${count}`);

    if (error) {
      console.error('ERROR in fetchPedidosPorCliente:', error);
      console.error('ERROR details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data) {
      console.error('ERROR: No data returned from get_pedidos_por_cliente function!');
      return [];
    }
    
    // Log count of returned records 
    console.log(`DIAGNOSTIC LOG: Total clients returned from database: ${data.length || 0}`);
    
    // Count total distinct orders for verification
    let totalPedidosDistintosBanco = 0;
    data.forEach(cliente => {
      if (cliente.total_pedidos_distintos) {
        totalPedidosDistintosBanco += cliente.total_pedidos_distintos;
      }
    });
    
    console.log(`DIAGNOSTIC LOG: Sum of total_pedidos_distintos from database: ${totalPedidosDistintosBanco}`);
    
    // Verify data integrity
    const clientesComProblemas = data.filter(c => !c.cliente_nome || !c.pes_codigo || !c.total_pedidos_distintos);
    if (clientesComProblemas.length > 0) {
      console.warn(`ALERTA: Encontrados ${clientesComProblemas.length} clientes com dados incompletos`);
      clientesComProblemas.forEach((c, i) => {
        console.warn(`Problema ${i+1}:`, {
          pes_codigo: c.pes_codigo || 'MISSING',
          cliente_nome: c.cliente_nome || 'MISSING', 
          total_pedidos_distintos: c.total_pedidos_distintos || 'MISSING'
        });
      });
    }
    
    // Log all client codes and names to help identify any issues
    console.log(`DIAGNOSTIC LOG: All client codes and names (${data.length}):`);
    const clientsInfo = data.map(c => ({ 
      code: c.pes_codigo, 
      name: c.cliente_nome || 'MISSING NAME', 
      orders: c.total_pedidos_distintos || 0 
    }));
    console.log(JSON.stringify(clientsInfo));
    
    return data;
  } catch (error) {
    console.error('FATAL ERROR in fetchPedidosPorCliente:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  }
}
