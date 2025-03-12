
import type { JabOrder } from "@/types/jabOrders";
import { fetchItensPorCliente, fetchEstoqueParaItens } from "./pedidosPorClienteUtils";

/**
 * Processes the detailed order data into a structured format
 */
export function processOrdersData(
  numeroPedidos: string[],
  pedidosDetalhados: any[],
  pessoasMap: Map<number, any>,
  itemMap: Map<string, string>,
  estoqueMap: Map<string, number>,
  representantesMap: Map<number, string>,
  pedidosAgrupados: Map<string, any[]>,
  itensSeparacao: Record<string, boolean>
): JabOrder[] {
  return numeroPedidos.map(numPedido => {
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
}

/**
 * Groups order data by order number
 */
export function groupOrdersByNumber(pedidosDetalhados: any[]): Map<string, any[]> {
  const pedidosAgrupados = new Map<string, any[]>();
  
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });
  
  return pedidosAgrupados;
}

/**
 * Processes client orders data into a structured format
 * Uses the optimized database functions
 */
export async function processClientOrdersData(
  dataInicial: string,
  dataFinal: string,
  clientesComPedidos: any[],
  itensSeparacao: Record<string, boolean>
): Promise<Record<string, any>> {
  const clientGroups: Record<string, any> = {};
  
  for (const cliente of clientesComPedidos) {
    const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
    const representanteName = cliente.representante_nome || 'Não informado';
    
    // Calcular valores para potencial de faturamento
    let totalValorFaturarComEstoque = 0;
    let totalQuantidadeSaldo = cliente.total_quantidade_saldo || 0;
    let totalValorSaldo = cliente.total_valor_saldo || 0;
    
    // Buscar itens do cliente com a função otimizada
    const itensCliente = await fetchItensPorCliente(dataInicial, dataFinal, cliente.pes_codigo);
    
    if (itensCliente && itensCliente.length > 0) {
      // Buscar informações de estoque para os itens com a função otimizada
      const itemCodigos = itensCliente.map(item => item.item_codigo);
      const estoqueData = await fetchEstoqueParaItens(itemCodigos);
      const estoqueMap = new Map(estoqueData.map(e => [e.item_codigo, e.fisico]));
      
      // Processar itens com informações de estoque
      const itensProcessados = itensCliente.map(item => {
        const estoqueDisponivel = estoqueMap.get(item.item_codigo) || 0;
        const emSeparacao = itensSeparacao[item.item_codigo] || false;
        const valorItem = (item.qtde_saldo || 0) * (item.valor_unitario || 0);
        
        // Calcular valor que pode ser faturado com base no estoque disponível
        if (estoqueDisponivel > 0 && item.qtde_saldo > 0) {
          const quantidadePossivel = Math.min(estoqueDisponivel, item.qtde_saldo);
          totalValorFaturarComEstoque += quantidadePossivel * (item.valor_unitario || 0);
        }
        
        return {
          ...item,
          fisico: estoqueDisponivel,
          emSeparacao,
          valor_total: valorItem
        };
      });
      
      // Adicionar grupo de cliente
      clientGroups[clienteName] = {
        PES_CODIGO: cliente.pes_codigo,
        representante: representanteName,
        representante_codigo: cliente.representante_codigo,
        totalQuantidadeSaldo,
        totalValorSaldo,
        totalValorPedido: cliente.total_valor_pedido || 0,
        totalValorFaturado: cliente.total_valor_faturado || 0,
        totalValorFaturarComEstoque,
        volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
        allItems: itensProcessados
      };
    }
  }
  
  return clientGroups;
}
