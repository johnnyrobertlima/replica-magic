
import { supabase } from "@/integrations/supabase/client";
import type { OrdersProcessingResult } from "./types";
import { fetchPedidosDetalhados, fetchItensSeparacao, fetchRelatedData } from "./fetchUtils";
import { processOrdersData, groupOrdersByNumber } from "./orderProcessUtils";

export async function fetchAllPedidosDireto(
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

export async function processOrdersFetch(
  dataInicial: string,
  dataFinal: string,
  numeroPedidos: string[],
  pedidosDetalhados: any[],
  totalCount: number
): Promise<OrdersProcessingResult> {
  // Extract unique IDs
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];
  const representantesCodigos = [...new Set(pedidosDetalhados.map(p => p.REPRESENTANTE).filter(id => id !== null))] as number[];

  console.log(`Encontrados ${pessoasIds.length} clientes, ${representantesCodigos.length} representantes e ${itemCodigos.length} itens diferentes`);

  // Fetch related data in parallel
  const [relatedData, itensSeparacao] = await Promise.all([
    fetchRelatedData(pessoasIds, itemCodigos, representantesCodigos),
    fetchItensSeparacao()
  ]);

  const { pessoas, itens, estoque, representantes } = relatedData;

  // Create Maps for efficient data access
  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));
  const representantesMap = new Map(representantes.map(r => [r.PES_CODIGO, r.RAZAOSOCIAL]));

  const pedidosAgrupados = groupOrdersByNumber(pedidosDetalhados);

  const orders = processOrdersData(
    numeroPedidos,
    pedidosDetalhados,
    pessoasMap,
    itemMap,
    estoqueMap,
    representantesMap,
    pedidosAgrupados,
    itensSeparacao
  );

  return {
    orders,
    totalCount,
    currentPage: 1,
    pageSize: numeroPedidos.length,
    itensSeparacao
  };
}
