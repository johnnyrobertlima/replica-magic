
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

async function fetchPedidosDetalhados(numeroPedidos: string[]) {
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
      DATA_PEDIDO
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

  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(Boolean))];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);

  // Criamos os mapas para lookup rápido
  const apelidoMap = new Map(pessoas.map(p => [p.PES_CODIGO, p.APELIDO]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));

  // Agrupamos os pedidos
  const pedidosAgrupados = new Map<string, any[]>();
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });

  // Processamos os pedidos agrupados mantendo a ordem original
  const orders: JabOrder[] = numeroPedidos.map(numPedido => {
    const pedidos = pedidosAgrupados.get(numPedido) || [];
    const primeiroPedido = pedidos[0];
    
    if (!primeiroPedido) {
      console.log('Pedido não encontrado:', numPedido);
      return null;
    }

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
        FISICO: estoqueMap.get(pedido.ITEM_CODIGO) || null
      });
    });

    return {
      MATRIZ: primeiroPedido.MATRIZ || 0,
      FILIAL: primeiroPedido.FILIAL || 0,
      PED_NUMPEDIDO: primeiroPedido.PED_NUMPEDIDO,
      PED_ANOBASE: primeiroPedido.PED_ANOBASE || 0,
      total_saldo,
      valor_total,
      APELIDO: primeiroPedido.PES_CODIGO ? apelidoMap.get(primeiroPedido.PES_CODIGO) || null : null,
      PEDIDO_CLIENTE: primeiroPedido.PEDIDO_CLIENTE || null,
      STATUS: primeiroPedido.STATUS || '',
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

export async function fetchJabTotals(): Promise<JabTotalsResponse> {
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
