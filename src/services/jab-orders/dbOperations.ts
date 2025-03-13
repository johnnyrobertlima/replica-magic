
import { supabase } from "@/integrations/supabase/client";
import { batchArray } from "./utils";
import type { PedidoUnicoResult } from "@/types/jabOrders";

export async function fetchPedidosUnicos(
  dataInicial: string, 
  dataFinal: string, 
  page: number, 
  pageSize: number
): Promise<{ data: PedidoUnicoResult[], totalCount: number }> {
  const { data: todosPedidos, error } = await supabase.rpc('get_pedidos_unicos', {
    data_inicial: dataInicial,
    data_final: `${dataFinal} 23:59:59.999`,
    offset_val: (page - 1) * pageSize,
    limit_val: pageSize
  });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }

  if (!todosPedidos?.length) {
    return { data: [], totalCount: 0 };
  }

  return { 
    data: todosPedidos as PedidoUnicoResult[], 
    totalCount: todosPedidos[0].total_count 
  };
}

export async function fetchAllPedidosUnicos(
  dataInicial: string, 
  dataFinal: string
): Promise<{ data: PedidoUnicoResult[], totalCount: number }> {
  const { data, error } = await supabase.rpc('get_pedidos_unicos', {
    data_inicial: dataInicial,
    data_final: `${dataFinal} 23:59:59.999`,
    offset_val: 0,
    limit_val: 9999 // Um número grande para pegar todos
  });

  if (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }

  if (!data?.length) {
    return { data: [], totalCount: 0 };
  }

  return {
    data: data as PedidoUnicoResult[],
    totalCount: data[0].total_count
  };
}

export async function fetchAllPedidosDireto(
  dataInicial: string, 
  dataFinal: string
): Promise<any[]> {
  console.log('Buscando todos os pedidos diretamente para o período:', { dataInicial, dataFinal });
  
  // Devido ao limite de 1000 registros por consulta, precisamos buscar em lotes
  let allPedidos: any[] = [];
  let hasMore = true;
  let page = 0;
  const pageSize = 1000;
  
  while (hasMore) {
    console.log(`Buscando lote ${page + 1} de pedidos (${pageSize} por lote)`);
    
    const { data, error, count } = await supabase
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
      `, { count: 'exact' })
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', dataInicial)
      .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`)
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('PED_NUMPEDIDO');

    if (error) {
      console.error(`Erro ao buscar lote ${page + 1} de pedidos:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      allPedidos = [...allPedidos, ...data];
      console.log(`Lote ${page + 1}: Recebidos ${data.length} pedidos. Total até agora: ${allPedidos.length}`);
      
      // Verifica se ainda há mais dados para buscar
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Encontrados ${allPedidos.length} registros de pedidos diretamente em ${page + 1} lotes`);
  return allPedidos;
}

export async function fetchPedidosDetalhados(numeroPedidos: string[]) {
  if (!numeroPedidos.length) return [];
  
  // Divide em lotes de 100 para não exceder limites de consulta
  const batchSize = 100;
  const batches = batchArray(numeroPedidos, batchSize);
  
  console.log(`Buscando detalhes em ${batches.length} lotes`);
  
  // Busca cada lote de pedidos
  const allResults = [];
  for (const batch of batches) {
    const { data, error } = await supabase
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
      .in('PED_NUMPEDIDO', batch);

    if (error) {
      console.error('Erro ao buscar detalhes dos pedidos:', error);
      throw error;
    }
    
    if (data) {
      allResults.push(...data);
    }
  }

  return allResults;
}

export async function fetchRelatedData(pessoasIds: number[], itemCodigos: string[]) {
  if (!pessoasIds.length || !itemCodigos.length) {
    return {
      pessoas: [],
      itens: [],
      estoque: []
    };
  }
  
  const batchSizePessoas = 100;
  const batchSizeItens = 100;
  const pessoasBatches = batchArray(pessoasIds, batchSizePessoas);
  const itensBatches = batchArray(itemCodigos, batchSizeItens);
  
  // Busca pessoas
  const allPessoas = [];
  for (const batch of pessoasBatches) {
    const { data } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', batch);
    
    if (data) {
      allPessoas.push(...data);
    }
  }
  
  // Busca itens
  const allItens = [];
  for (const batch of itensBatches) {
    const { data } = await supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO')
      .in('ITEM_CODIGO', batch);
    
    if (data) {
      allItens.push(...data);
    }
  }
  
  // Busca estoque
  const allEstoque = [];
  for (const batch of itensBatches) {
    const { data } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('ITEM_CODIGO, FISICO')
      .in('ITEM_CODIGO', batch);
    
    if (data) {
      allEstoque.push(...data);
    }
  }

  return {
    pessoas: allPessoas,
    itens: allItens,
    estoque: allEstoque
  };
}

export async function fetchItensSeparacao() {
  // Busca itens em separação com status "pendente"
  const { data, error } = await supabase
    .from('separacao_itens')
    .select(`
      item_codigo,
      separacoes(status)
    `)
    .eq('separacoes.status', 'pendente');

  if (error) {
    console.error('Erro ao buscar itens em separação:', error);
    return {};
  }

  // Cria um mapa de códigos de item -> true para fácil verificação
  const itensSeparacaoMap: Record<string, boolean> = {};
  if (data) {
    data.forEach(item => {
      if (item.item_codigo) {
        itensSeparacaoMap[item.item_codigo] = true;
      }
    });
  }

  console.log(`Encontrados ${Object.keys(itensSeparacaoMap).length} itens em separação`);
  return itensSeparacaoMap;
}
