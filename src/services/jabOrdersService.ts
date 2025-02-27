
import { supabase } from "@/integrations/supabase/client";
import type { 
  PedidoUnicoResult, 
  JabOrder, 
  UseJabOrdersOptions,
  JabOrdersResponse,
  JabTotalsResponse,
  UseJabOrdersByClientOptions,
  JabOrdersByClientResponse
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

async function fetchAllPedidos(
  dataInicial: string, 
  dataFinal: string
): Promise<any[]> {
  // Vamos buscar diretamente todos os detalhes dos pedidos
  // para evitar múltiplas consultas e garantir que todos os dados sejam capturados
  console.log('Buscando todos os pedidos detalhados para o período:', { dataInicial, dataFinal });
  
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
    .gte('DATA_PEDIDO', dataInicial)
    .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`)
    .order('PED_NUMPEDIDO');

  if (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }

  return data || [];
}

async function fetchPedidosDetalhados(numeroPedidos: string[]) {
  if (!numeroPedidos.length) return [];
  
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
    .in('PED_NUMPEDIDO', numeroPedidos);

  if (error) {
    console.error('Erro ao buscar detalhes dos pedidos:', error);
    throw error;
  }

  return data || [];
}

async function fetchRelatedData(pessoasIds: number[], itemCodigos: string[]) {
  if (!pessoasIds.length || !itemCodigos.length) {
    return {
      pessoas: [],
      itens: [],
      estoque: []
    };
  }
  
  const [pessoasResponse, itensResponse, estoqueResponse] = await Promise.all([
    supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', pessoasIds),
    supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO')
      .in('ITEM_CODIGO', itemCodigos),
    supabase
      .from('BLUEBAY_ESTOQUE')
      .select('ITEM_CODIGO, FISICO')
      .in('ITEM_CODIGO', itemCodigos)
  ]);

  return {
    pessoas: pessoasResponse.data || [],
    itens: itensResponse.data || [],
    estoque: estoqueResponse.data || []
  };
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

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);

  // Cria mapas para lookup rápido
  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));

  // Agrupa os pedidos
  const pedidosAgrupados = new Map<string, any[]>();
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });

  // Processa os pedidos agrupados mantendo a ordem original
  const orders: JabOrder[] = numeroPedidos.map(numPedido => {
    const pedidos = pedidosAgrupados.get(numPedido) || [];
    const primeiroPedido = pedidos[0];
    
    if (!primeiroPedido) {
      console.log('Pedido não encontrado:', numPedido);
      return null;
    }

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
      REPRESENTANTE_NOME: primeiroPedido.REPRESENTANTE || null,
      PES_CODIGO: primeiroPedido.PES_CODIGO,
      items: Array.from(items.values())
    };
  }).filter(Boolean) as JabOrder[];

  return {
    orders,
    totalCount,
    currentPage: page,
    pageSize
  };
}

export async function fetchJabOrdersByClient({ 
  dateRange 
}: UseJabOrdersByClientOptions): Promise<JabOrdersByClientResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { clientGroups: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  // Buscar todos os pedidos detalhados diretamente em uma consulta só
  const pedidosDetalhados = await fetchAllPedidos(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { clientGroups: {} };
  }

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  console.log(`Encontrados ${pessoasIds.length} clientes e ${itemCodigos.length} itens diferentes`);

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);

  // Cria mapas para lookup rápido
  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));

  // Extrair números de pedidos únicos dos pedidos detalhados
  const numeroPedidosSet = new Set<string>();
  pedidosDetalhados.forEach(pedido => {
    if (pedido.PED_NUMPEDIDO) {
      numeroPedidosSet.add(pedido.PED_NUMPEDIDO);
    }
  });
  const numeroPedidos = Array.from(numeroPedidosSet);

  console.log(`Encontrados ${numeroPedidos.length} pedidos únicos`);

  // Agrupa os pedidos por número de pedido
  const pedidosAgrupados = new Map<string, any[]>();
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });

  // Processa os pedidos agrupados
  const orders: JabOrder[] = numeroPedidos.map(numPedido => {
    const pedidos = pedidosAgrupados.get(numPedido) || [];
    const primeiroPedido = pedidos[0];
    
    if (!primeiroPedido) {
      console.log('Pedido não encontrado:', numPedido);
      return null;
    }

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
      REPRESENTANTE_NOME: primeiroPedido.REPRESENTANTE || null,
      PES_CODIGO: primeiroPedido.PES_CODIGO,
      items: Array.from(items.values())
    };
  }).filter(Boolean) as JabOrder[];

  console.log(`Processados ${orders.length} pedidos`);

  // Agora vamos agrupar os pedidos por cliente (usando PES_CODIGO para garantir precisão)
  const clientGroupsMap = new Map<number, {
    APELIDO: string | null;
    pedidos: JabOrder[];
    totalQuantidadeSaldo: number;
    totalValorSaldo: number;
    totalValorPedido: number;
    totalValorFaturado: number;
    totalValorFaturarComEstoque: number;
    representante: string | null;
    allItems: any[];
    PES_CODIGO: number;
  }>();
  
  orders.forEach(order => {
    if (!order.PES_CODIGO) {
      console.log('Pedido sem PES_CODIGO:', order.PED_NUMPEDIDO);
      return;
    }
    
    if (!clientGroupsMap.has(order.PES_CODIGO)) {
      clientGroupsMap.set(order.PES_CODIGO, {
        APELIDO: order.APELIDO,
        pedidos: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: order.REPRESENTANTE_NOME,
        allItems: [],
        PES_CODIGO: order.PES_CODIGO
      });
    }
    
    const clientData = clientGroupsMap.get(order.PES_CODIGO)!;
    
    clientData.pedidos.push(order);
    clientData.totalQuantidadeSaldo += order.total_saldo || 0;
    clientData.totalValorSaldo += order.valor_total || 0;
    
    if (order.items) {
      const items = order.items.map(item => ({
        ...item,
        pedido: order.PED_NUMPEDIDO,
        APELIDO: order.APELIDO,
        PES_CODIGO: order.PES_CODIGO
      }));
      
      clientData.allItems.push(...items);
      
      order.items.forEach(item => {
        clientData.totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
        clientData.totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
        if ((item.FISICO || 0) > 0) {
          clientData.totalValorFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
        }
      });
    }
  });

  // Converter o Map em um objeto para retornar
  const clientGroups: JabOrdersByClientResponse['clientGroups'] = {};
  clientGroupsMap.forEach((data, pesCode) => {
    const clientKey = data.APELIDO || `Cliente ${pesCode}`;
    clientGroups[clientKey] = data;
  });

  console.log(`Agrupados em ${Object.keys(clientGroups).length} clientes`);

  return { clientGroups };
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
