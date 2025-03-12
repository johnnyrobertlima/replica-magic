
import { supabase } from "@/integrations/supabase/client";
import type { PedidosPorClienteResult, ItensPorClienteResult, EstoqueItemResult } from "./types";

/**
 * Busca os pedidos agrupados por cliente para o período especificado
 * Utiliza a função otimizada no banco de dados
 */
export async function fetchPedidosPorCliente(dataInicial: string, dataFinal: string) {
  console.log('Buscando pedidos agrupados por cliente para o período:', { dataInicial, dataFinal });
  
  try {
    // Use the correct function name as a string literal for the RPC call
    const { data, error } = await supabase.rpc('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: `${dataFinal} 23:59:59.999`
    }) as { data: PedidosPorClienteResult[] | null, error: any };

    if (error) {
      console.error('Erro ao buscar pedidos por cliente:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} clientes com pedidos no período`);
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
    // Use the correct function name as a string literal for the RPC call
    const { data, error } = await supabase.rpc('get_itens_por_cliente', {
      data_inicial: dataInicial,
      data_final: `${dataFinal} 23:59:59.999`,
      cliente_codigo: clienteCodigo
    }) as { data: ItensPorClienteResult[] | null, error: any };

    if (error) {
      console.error('Erro ao buscar itens do cliente:', error);
      throw error;
    }
    
    console.log(`Encontrados ${data?.length || 0} itens para o cliente ${clienteCodigo}`);
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
    // Use the correct function name as a string literal for the RPC call
    const { data, error } = await supabase.rpc('get_estoque_para_itens', {
      item_codigos: itemCodigos
    }) as { data: EstoqueItemResult[] | null, error: any };

    if (error) {
      console.error('Erro ao buscar estoque para os itens:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar estoque para os itens:', error);
    throw error;
  }
}
