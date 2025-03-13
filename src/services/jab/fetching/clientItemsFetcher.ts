
import { supabase } from "@/integrations/supabase/client";
import type { ItensPorClienteResult } from "../types";

/**
 * Fetches items for a specific client for the specified date range
 * Uses the optimized database function
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
