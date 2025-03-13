
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
    
    // Log SQL query being executed (for debugging)
    console.log(`Executando RPC: get_pedidos_por_cliente(${dataInicial}, ${dataFinalCompleta})`);
    
    // Execute the RPC call with debugging info
    const startTime = Date.now();
    console.log(`Starting RPC call to get_pedidos_por_cliente at ${new Date().toISOString()}`);
    
    const { data, error } = await supabase.rpc('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: dataFinalCompleta
    }) as { data: PedidosPorClienteResult[] | null, error: any };

    const endTime = Date.now();
    console.log(`RPC call completed in ${endTime - startTime}ms`);

    if (error) {
      console.error('Erro ao buscar pedidos por cliente:', error);
      throw error;
    }
    
    // Verificando número total de registros retornados 
    console.log(`Total de clientes retornados da função get_pedidos_por_cliente: ${data?.length || 0}`);
    
    // Contando número total de pedidos para comparação com a consulta SQL
    let totalPedidosClient = 0;
    data?.forEach(cliente => {
      if (cliente.total_pedidos_distintos) {
        totalPedidosClient += cliente.total_pedidos_distintos;
      }
    });
    
    console.log(`Total de pedidos distintos calculado pelo client: ${totalPedidosClient}`);
    
    // Specifically look for LAGUNA client and log detailed info
    if (data && data.length > 0) {
      const laguna = data.find(cliente => 
        cliente.cliente_nome?.toLowerCase().includes('laguna'));
      
      if (laguna) {
        console.log('Cliente Laguna encontrado:', {
          codigo: laguna.pes_codigo,
          nome: laguna.cliente_nome,
          total_quantidade_saldo: laguna.total_quantidade_saldo,
          total_valor_saldo: laguna.total_valor_saldo,
          total_pedidos_distintos: laguna.total_pedidos_distintos
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
