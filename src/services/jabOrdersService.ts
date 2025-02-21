
import { supabase } from "@/integrations/supabase/client";
import type { JabOrder } from "@/types/jabOrders";

interface PedidoAgrupado {
  pes_codigo: number;
  quantidade_pedidos: number;
  quantidade_itens_com_saldo: number;
  valor_do_saldo: number;
}

export async function fetchPessoasCodigos(dataInicial: string, dataFinal: string) {
  console.log('Buscando pessoas no período:', {dataInicial, dataFinal});
  
  // Using direct query instead of rpc to debug
  const { data, error } = await supabase
    .from('BLUEBAY_PEDIDO')
    .select(`
      PES_CODIGO,
      COUNT(DISTINCT PED_NUMPEDIDO)::bigint as quantidade_pedidos,
      SUM(QTDE_SALDO)::numeric as quantidade_itens_com_saldo,
      SUM(QTDE_SALDO * VALOR_UNITARIO)::numeric as valor_do_saldo
    `)
    .eq('CENTROCUSTO', 'JAB')
    .gte('DATA_PEDIDO', dataInicial.split('T')[0])
    .lte('DATA_PEDIDO', dataFinal.split('T')[0])
    .not('PES_CODIGO', 'is', null)
    .groupBy('PES_CODIGO');

  if (error) {
    console.error('Erro ao buscar PES_CODIGO:', error);
    throw error;
  }

  console.log('Resultado da busca de pessoas:', data);
  return (data || []) as PedidoAgrupado[];
}

export async function fetchPedidos(dataInicial: string, dataFinal: string, pesCodigos: number[]) {
  console.log('Buscando pedidos com params:', {
    dataInicial,
    dataFinal,
    totalPesCodigos: pesCodigos.length
  });

  const { data, error } = await supabase
    .from('BLUEBAY_PEDIDO')
    .select(`
      MATRIZ,
      FILIAL,
      PED_NUMPEDIDO,
      PED_ANOBASE,
      QTDE_SALDO,
      QTDE_PEDIDA,
      QTDE_ENTREGUE,
      VALOR_UNITARIO,
      PEDIDO_CLIENTE,
      STATUS,
      ITEM_CODIGO,
      DATA_PEDIDO,
      PES_CODIGO
    `)
    .eq('CENTROCUSTO', 'JAB')
    .gte('DATA_PEDIDO', dataInicial.split('T')[0])
    .lte('DATA_PEDIDO', dataFinal.split('T')[0])
    .in('PES_CODIGO', pesCodigos)
    .order('DATA_PEDIDO', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }

  console.log('Total de pedidos encontrados:', data?.length || 0);
  return data || [];
}

export async function fetchItensDescricoes(itemCodigos: string[]) {
  const { data, error } = await supabase
    .from('BLUEBAY_ITEM')
    .select('ITEM_CODIGO, DESCRICAO')
    .in('ITEM_CODIGO', itemCodigos);

  if (error) {
    console.error('Erro ao buscar descrições dos itens:', error);
    throw error;
  }

  return data || [];
}

export function processOrders(
  pedidosData: any[], 
  itemMap: Map<string, string>
): JabOrder[] {
  return pedidosData.map(pedido => {
    const saldo = pedido.QTDE_SALDO || 0;
    const valorUnitario = pedido.VALOR_UNITARIO || 0;

    return {
      MATRIZ: pedido.MATRIZ || 0,
      FILIAL: pedido.FILIAL ?? 0,
      PED_NUMPEDIDO: pedido.PED_NUMPEDIDO || '',
      PED_ANOBASE: pedido.PED_ANOBASE || 0,
      QTDE_SALDO: saldo,
      QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
      QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
      VALOR_UNITARIO: valorUnitario,
      total_saldo: saldo,
      valor_total: saldo * valorUnitario,
      PES_CODIGO: pedido.PES_CODIGO || 0,
      PEDIDO_CLIENTE: pedido.PEDIDO_CLIENTE || null,
      STATUS: pedido.STATUS || '',
      ITEM_CODIGO: pedido.ITEM_CODIGO || '',
      DESCRICAO: itemMap.get(pedido.ITEM_CODIGO || '') || null,
      items: []
    };
  });
}
