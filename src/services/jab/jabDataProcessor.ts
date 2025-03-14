
import type { JabOrder, JabOrdersResponse } from "@/types/jabOrders";
import { fetchRelatedData, fetchItensSeparacao } from "./jabSupabaseClient";

export async function processJabOrders(
  pedidosDetalhados: any[],
  numeroPedidos: string[]
): Promise<JabOrdersResponse> {
  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);
  const itensSeparacao = await fetchItensSeparacao();

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
      REPRESENTANTE_NOME: primeiroPedido.REPRESENTANTE || null,
      PES_CODIGO: primeiroPedido.PES_CODIGO,
      REPRESENTANTE: primeiroPedido.REPRESENTANTE,
      volume_saudavel_faturamento: pessoa?.volume_saudavel_faturamento || null,
      items: Array.from(items.values())
    };
  }).filter(Boolean) as JabOrder[];

  return {
    orders,
    totalCount: numeroPedidos.length,
    itensSeparacao
  };
}

export async function processAllJabOrders(
  pedidosDetalhados: any[]
): Promise<JabOrdersResponse> {
  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  // Extrair números de pedidos únicos
  const numeroPedidosSet = new Set<string>();
  pedidosDetalhados.forEach(pedido => {
    if (pedido.PED_NUMPEDIDO) {
      numeroPedidosSet.add(pedido.PED_NUMPEDIDO);
    }
  });
  const numeroPedidos = Array.from(numeroPedidosSet);
  
  console.log(`Total de ${numeroPedidos.length} pedidos únicos encontrados`);

  const ordersResponse = await processJabOrders(pedidosDetalhados, numeroPedidos);
  
  // Agrupar por cliente (usando PES_CODIGO como chave)
  const clientGroupsMap = new Map<number, JabOrder[]>();
  
  ordersResponse.orders.forEach(order => {
    if (!order.PES_CODIGO) return;
    
    if (!clientGroupsMap.has(order.PES_CODIGO)) {
      clientGroupsMap.set(order.PES_CODIGO, []);
    }
    
    clientGroupsMap.get(order.PES_CODIGO)!.push(order);
  });

  console.log(`Agrupados em ${clientGroupsMap.size} clientes`);

  // Transformar em uma lista plana
  const ordersFlat = Array.from(clientGroupsMap.values()).flat();

  return {
    orders: ordersFlat,
    totalCount: numeroPedidos.length,
    itensSeparacao: ordersResponse.itensSeparacao
  };
}
