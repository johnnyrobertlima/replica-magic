
import { supabase } from "@/integrations/supabase/client";

// Define types for RPC results
interface PedidosPorClienteResult {
  pes_codigo: number;
  cliente_nome: string;
  representante_codigo: number;
  representante_nome: string;
  total_valor_pedido: number;
  total_valor_faturado: number;
  total_valor_saldo: number;
  total_quantidade_saldo: number;
  volume_saudavel_faturamento: number;
}

interface ItensPorClienteResult {
  item_codigo: string;
  descricao: string;
  qtde_pedida: number;
  qtde_entregue: number;
  qtde_saldo: number;
  valor_unitario: number;
  pedido: string;
  representante: number;
}

interface EstoqueItemResult {
  item_codigo: string;
  fisico: number;
}

/**
 * Busca os pedidos agrupados por cliente para o período especificado
 * Utiliza a função otimizada no banco de dados
 */
export async function fetchPedidosPorCliente(dataInicial: string, dataFinal: string) {
  console.log('Buscando pedidos agrupados por cliente para o período:', { dataInicial, dataFinal });
  
  try {
    // Specify the correct types for the RPC call
    const { data, error } = await supabase.rpc<PedidosPorClienteResult, {
      data_inicial: string;
      data_final: string;
    }>('get_pedidos_por_cliente', {
      data_inicial: dataInicial,
      data_final: `${dataFinal} 23:59:59.999`
    });

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
    // Specify the correct types for the RPC call
    const { data, error } = await supabase.rpc<ItensPorClienteResult, {
      data_inicial: string;
      data_final: string;
      cliente_codigo: number;
    }>('get_itens_por_cliente', {
      data_inicial: dataInicial,
      data_final: `${dataFinal} 23:59:59.999`,
      cliente_codigo: clienteCodigo
    });

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
    // Specify the correct types for the RPC call
    const { data, error } = await supabase.rpc<EstoqueItemResult, {
      item_codigos: string[];
    }>('get_estoque_para_itens', {
      item_codigos: itemCodigos
    });

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
