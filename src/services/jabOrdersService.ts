import { supabase } from "@/integrations/supabase/client";
import type { 
  PedidoUnicoResult, 
  JabOrder, 
  UseJabOrdersOptions,
  JabOrdersResponse,
  JabTotalsResponse
} from "@/types/jabOrders";

async function fetchPedidosUnicos(
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

async function fetchAllPedidosUnicos(
  dataInicial: string, 
  dataFinal: string
): Promise<{ data: PedidoUnicoResult[], totalCount: number }> {
  const { data, error } = await supabase.rpc('get_pedidos_unicos', {
    data_inicial: dataInicial,
    data_final: `${dataFinal} 23:59:59.999`,
    offset_val: 0,
    limit_val: 9999
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

async function fetchAllPedidosDireto(
  dataInicial: string, 
  dataFinal: string
): Promise<any[]> {
  console.log('Buscando todos os pedidos diretamente para o período:', { dataInicial, dataFinal });
  
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

async function fetchPedidosDetalhados(numeroPedidos: string[]) {
  if (!numeroPedidos.length) return [];
  
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < numeroPedidos.length; i += batchSize) {
    batches.push(numeroPedidos.slice(i, i + batchSize));
  }
  
  console.log(`Buscando detalhes em ${batches.length} lotes`);
  
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

async function fetchRelatedData(pessoasIds: number[], itemCodigos: string[], representantesCodigos: number[] = []) {
  if (!pessoasIds.length || !itemCodigos.length) {
    return {
      pessoas: [],
      itens: [],
      estoque: [],
      representantes: []
    };
  }
  
  const batchSizePessoas = 100;
  const batchSizeItens = 100;
  const batchSizeRepresentantes = 100;
  const pessoasBatches = [];
  const itensBatches = [];
  const representantesBatches = [];
  
  for (let i = 0; i < pessoasIds.length; i += batchSizePessoas) {
    pessoasBatches.push(pessoasIds.slice(i, i + batchSizePessoas));
  }
  
  for (let i = 0; i < itemCodigos.length; i += batchSizeItens) {
    itensBatches.push(itemCodigos.slice(i, i + batchSizeItens));
  }

  if (representantesCodigos.length > 0) {
    for (let i = 0; i < representantesCodigos.length; i += batchSizeRepresentantes) {
      representantesBatches.push(representantesCodigos.slice(i, i + batchSizeRepresentantes));
    }
  }
  
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

  const allRepresentantes = [];
  if (representantesBatches.length > 0) {
    for (const batch of representantesBatches) {
      const { data } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, RAZAOSOCIAL')
        .in('PES_CODIGO', batch);
      
      if (data) {
        allRepresentantes.push(...data);
      }
    }
  }

  return {
    pessoas: allPessoas,
    itens: allItens,
    estoque: allEstoque,
    representantes: allRepresentantes
  };
}

async function fetchItensSeparacao() {
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

export async function fetchJabOrders({ 
  dateRange, 
  page = 1, 
  pageSize = 15 
}: UseJabOrdersOptions): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando pedidos para o período:', { dataInicial, dataFinal, page, pageSize });

  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize);
  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    return { orders: [], totalCount };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount };
  }

  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];
  const representantesCodigos = [...new Set(pedidosDetalhados.map(p => p.REPRESENTANTE).filter(id => id !== null && id !== undefined))] as number[];

  console.log(`Encontrados ${pessoasIds.length} clientes, ${representantesCodigos.length} representantes e ${itemCodigos.length} itens diferentes`);

  const { pessoas, itens, estoque, representantes } = await fetchRelatedData(pessoasIds, itemCodigos, representantesCodigos);
  const itensSeparacao = await fetchItensSeparacao();

  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));
  const representantesMap = new Map(representantes.map(r => [r.PES_CODIGO, r.RAZAOSOCIAL]));

  const pedidosAgrupados = new Map<string, any[]>();
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });

  const orders: JabOrder[] = numeroPedidos.map(numPedido => {
    const pedidos = pedidosAgrupados.get(numPedido) || [];
    if (!pedidos.length) {
      console.log('Pedido sem detalhes:', numPedido);
      return null;
    }
    
    const primeiroPedido = pedidos[0];
    
    const pessoa = pessoasMap.get(primeiroPedido.PES_CODIGO);

    let total_saldo = 0;
    let valor_total = 0;
    const items = new Map<string, any>();

    pedidos.forEach(pedido => {
      if (!pedido.ITEM_CODIGO) return;

      const saldo = pedido.QTDE_SALDO || 0;
      const valorUnitario = pedido.VALOR_UNITARIO || 0;
      
      total_saldo += saldo;
      valor_total += saldo * valorUnitario;

      items.set(pedido.ITEM_CODIGO, {
        ITEM_CODIGO: pedido.ITEM_CODIGO,
        DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
        QTDE_SALDO: saldo,
        QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
        QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
        VALOR_UNITARIO: valorUnitario,
        FISICO: estoqueMap.get(pedido.ITEM_CODIGO) || null,
        emSeparacao: itensSeparacao[pedido.ITEM_CODIGO] || false,
        pedido: pedido.PED_NUMPEDIDO,
        APELIDO: pessoa?.APELIDO || null,
        PES_CODIGO: primeiroPedido.PES_CODIGO
      });
    });

    return {
      MATRIZ: primeiroPedido.MATRIZ || 0,
      FILIAL: primeiroPedido.FILIAL || 0,
      PED_NUMPEDIDO: primeiroPedido.PED_NUMPEDIDO,
      PED_ANOBASE: primeiroPedido.PED_ANOBASE || 0,
      total_saldo,
      valor_total,
      APELIDO: pessoa?.APELIDO || null,
      PEDIDO_CLIENTE: primeiroPedido.PEDIDO_CLIENTE || null,
      STATUS: primeiroPedido.STATUS || '',
      REPRESENTANTE_NOME: primeiroPedido.REPRESENTANTE ? representantesMap.get(primeiroPedido.REPRESENTANTE) || null : null,
      REPRESENTANTE_CODIGO: primeiroPedido.REPRESENTANTE || null,
      PES_CODIGO: primeiroPedido.PES_CODIGO,
      items: Array.from(items.values())
    };
  }).filter(Boolean) as JabOrder[];

  return {
    orders,
    totalCount,
    currentPage: page,
    pageSize,
    itensSeparacao
  };
}

export async function fetchAllJabOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  const numeroPedidosSet = new Set<string>();
  pedidosDetalhados.forEach(pedido => {
    if (pedido.PED_NUMPEDIDO) {
      numeroPedidosSet.add(pedido.PED_NUMPEDIDO);
    }
  });
  const numeroPedidos = Array.from(numeroPedidosSet);
  
  console.log(`Total de ${numeroPedidos.length} pedidos únicos encontrados`);

  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  console.log(`Encontrados ${pessoasIds.length} clientes e ${itemCodigos.length} itens diferentes`);

  const { pessoas, itens, estoque, representantes } = await fetchRelatedData(pessoasIds, itemCodigos);
  const itensSeparacao = await fetchItensSeparacao();

  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));
  const representantesMap = new Map(representantes.map(r => [r.PES_CODIGO, r.RAZAOSOCIAL]));

  const pedidosAgrupados = new Map<string, any[]>();
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });

  const orders: JabOrder[] = numeroPedidos.map(numPedido => {
    const pedidos = pedidosAgrupados.get(numPedido) || [];
    if (!pedidos.length) {
      console.log('Pedido sem detalhes:', numPedido);
      return null;
    }
    
    const primeiroPedido = pedidos[0];
    
    const pessoa = pessoasMap.get(primeiroPedido.PES_CODIGO);

    let total_saldo = 0;
    let valor_total = 0;
    const items = new Map<string, any>();

    pedidos.forEach(pedido => {
      if (!pedido.ITEM_CODIGO) return;

      const saldo = pedido.QTDE_SALDO || 0;
      const valorUnitario = pedido.VALOR_UNITARIO || 0;
      
      total_saldo += saldo;
      valor_total += saldo * valorUnitario;

      items.set(pedido.ITEM_CODIGO, {
        ITEM_CODIGO: pedido.ITEM_CODIGO,
        DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
        QTDE_SALDO: saldo,
        QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
        QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
        VALOR_UNITARIO: valorUnitario,
        FISICO: estoqueMap.get(pedido.ITEM_CODIGO) || null,
        emSeparacao: itensSeparacao[pedido.ITEM_CODIGO] || false,
        pedido: pedido.PED_NUMPEDIDO,
        APELIDO: pessoa?.APELIDO || null,
        PES_CODIGO: primeiroPedido.PES_CODIGO
      });
    });

    return {
      MATRIZ: primeiroPedido.MATRIZ || 0,
      FILIAL: primeiroPedido.FILIAL || 0,
      PED_NUMPEDIDO: primeiroPedido.PED_NUMPEDIDO,
      PED_ANOBASE: primeiroPedido.PED_ANOBASE || 0,
      total_saldo,
      valor_total,
      APELIDO: pessoa?.APELIDO || null,
      PEDIDO_CLIENTE: primeiroPedido.PEDIDO_CLIENTE || null,
      STATUS: primeiroPedido.STATUS || '',
      REPRESENTANTE_NOME: primeiroPedido.REPRESENTANTE ? representantesMap.get(primeiroPedido.REPRESENTANTE) || null : null,
      REPRESENTANTE_CODIGO: primeiroPedido.REPRESENTANTE || null,
      PES_CODIGO: primeiroPedido.PES_CODIGO,
      items: Array.from(items.values())
    };
  }).filter(Boolean) as JabOrder[];

  console.log(`Processados ${orders.length} pedidos`);

  const clientGroupsMap = new Map<number, JabOrder[]>();
  
  orders.forEach(order => {
    if (!order.PES_CODIGO) return;
    
    if (!clientGroupsMap.has(order.PES_CODIGO)) {
      clientGroupsMap.set(order.PES_CODIGO, []);
    }
    
    clientGroupsMap.get(order.PES_CODIGO)!.push(order);
  });

  console.log(`Agrupados em ${clientGroupsMap.size} clientes`);

  const ordersFlat = Array.from(clientGroupsMap.values()).flat();

  return {
    orders: ordersFlat,
    totalCount: numeroPedidos.length,
    currentPage: 1,
    pageSize: numeroPedidos.length,
    itensSeparacao
  };
}

export async function fetchTotals(): Promise<JabTotalsResponse> {
  const valorTotalResponse = await supabase.rpc('calcular_valor_total_jab');
  const valorFaturarResponse = await supabase.rpc('calcular_valor_faturar_com_estoque');

  if (valorTotalResponse.error) {
    console.error('Erro ao calcular valor total:', valorTotalResponse.error);
    throw valorTotalResponse.error;
  }

  if (valorFaturarResponse.error) {
    console.error('Erro ao calcular valor para faturar:', valorFaturarResponse.error);
    throw valorFaturarResponse.error;
  }

  const valorTotalSaldo = valorTotalResponse.data?.[0]?.valor_total_saldo || 0;
  const valorFaturarComEstoque = Number(valorFaturarResponse.data?.[0]?.valor_total_faturavel || 0);

  console.log('Valores calculados:', { valorTotalSaldo, valorFaturarComEstoque });

  return {
    valorTotalSaldo,
    valorFaturarComEstoque
  };
}
