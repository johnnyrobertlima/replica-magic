
import { supabase } from "@/integrations/supabase/client";
import type { JabOrder } from "@/types/jabOrders";

export async function fetchPessoasCodigos(dataInicial: string, dataFinal: string) {
  // Buscamos todos os PES_CODIGO que têm pedidos com saldo, independente da data
  const { data, error } = await supabase
    .from('BLUEBAY_PEDIDO')
    .select('PES_CODIGO')
    .eq('CENTROCUSTO', 'JAB')
    .gt('QTDE_SALDO', 0)
    .not('PES_CODIGO', 'is', null);

  if (error) throw error;
  return data || [];
}

export async function fetchPedidos(dataInicial: string, dataFinal: string, pesCodigos: number[]) {
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
    .gt('QTDE_SALDO', 0) // Adicionado filtro para trazer apenas pedidos com saldo
    .in('PES_CODIGO', pesCodigos)
    .order('DATA_PEDIDO', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchItensDescricoes(itemCodigos: string[]) {
  const { data, error } = await supabase
    .from('BLUEBAY_ITEM')
    .select('ITEM_CODIGO, DESCRICAO')
    .in('ITEM_CODIGO', itemCodigos);

  if (error) throw error;
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
