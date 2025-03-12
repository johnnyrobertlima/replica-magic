
import type { JabOrder } from "@/types/jabOrders";
import { supabase } from "@/integrations/supabase/client";

export function processOrdersData(
  numeroPedidos: string[],
  pedidosDetalhados: any[],
  pessoasMap: Map<number, any>,
  itemMap: Map<string, string>,
  estoqueMap: Map<string, number>,
  representantesMap: Map<number, string>,
  pedidosAgrupados: Record<string, any[]>,
  itensSeparacao: Record<string, number> = {}
): JabOrder[] {
  const orders: JabOrder[] = [];

  numeroPedidos.forEach(numeroPedido => {
    const pedidosDoNumero = pedidosAgrupados[numeroPedido] || [];

    if (pedidosDoNumero.length === 0) {
      return;
    }

    const primeiroPedido = pedidosDoNumero[0];
    const PES_CODIGO = primeiroPedido.PES_CODIGO;
    const REPRESENTANTE = primeiroPedido.REPRESENTANTE;

    const pessoa = pessoasMap.get(PES_CODIGO);
    const representanteNome = representantesMap.get(REPRESENTANTE) || null;

    let total_pedido = 0;
    let total_faturado = 0;
    let total_saldo = 0;

    const items = pedidosDoNumero.map(pedido => {
      const ITEM_CODIGO = pedido.ITEM_CODIGO;
      const DESCRICAO = itemMap.get(ITEM_CODIGO) || 'Descrição não encontrada';
      const FISICO = estoqueMap.get(ITEM_CODIGO) || 0;
      const QTDE_PEDIDA = pedido.QTDE_PEDIDA;
      const QTDE_ENTREGUE = pedido.QTDE_ENTREGUE || 0;
      const QTDE_SALDO = pedido.QTDE_SALDO;
      const VALOR_UNITARIO = pedido.VALOR_UNITARIO;

      const valor_total_item = QTDE_PEDIDA * VALOR_UNITARIO;
      const valor_faturado_item = QTDE_ENTREGUE * VALOR_UNITARIO;
      const valor_saldo_item = QTDE_SALDO * VALOR_UNITARIO;

      total_pedido += valor_total_item;
      total_faturado += valor_faturado_item;
      total_saldo += valor_saldo_item;

      return {
        ITEM_CODIGO,
        DESCRICAO,
        FISICO,
        QTDE_PEDIDA,
        QTDE_ENTREGUE,
        QTDE_SALDO,
        VALOR_UNITARIO,
        valor_total_item,
        valor_faturado_item,
        valor_saldo_item,
        ITEM_SEPARACAO: itensSeparacao[ITEM_CODIGO] || 0
      };
    });

    orders.push({
      PED_NUMPEDIDO: numeroPedido,
      PES_CODIGO: PES_CODIGO,
      APELIDO: pessoa ? pessoa.APELIDO : 'Cliente não encontrado',
      REPRESENTANTE_CODIGO: REPRESENTANTE, // Changed from REPRESENTANTE to REPRESENTANTE_CODIGO to match JabOrder type
      REPRESENTANTE_NOME: representanteNome,
      valor_total: total_pedido,
      valor_faturado: total_faturado,
      total_saldo: total_saldo,
      items: items,
      // Adding required properties from the JabOrder type
      MATRIZ: primeiroPedido.MATRIZ || 0,
      FILIAL: primeiroPedido.FILIAL || 0,
      PED_ANOBASE: primeiroPedido.PED_ANOBASE || 0,
      PEDIDO_CLIENTE: primeiroPedido.PEDIDO_CLIENTE || null,
      STATUS: primeiroPedido.STATUS || ''
    });
  });
  
  return orders;
}

export async function fetchClientesFinanceiros(pessoasIds: number[]) {
  try {
    if (!pessoasIds.length) return [];
    
    console.log(`Buscando informações financeiras para ${pessoasIds.length} clientes`);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, valoresVencidos')
      .in('PES_CODIGO', pessoasIds);
      
    if (error) {
      console.error("Erro ao buscar clientes financeiros:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar clientes financeiros:", error);
    return [];
  }
}

// Adding the missing groupOrdersByNumber function
export function groupOrdersByNumber(pedidos: any[]): Record<string, any[]> {
  const pedidosAgrupados: Record<string, any[]> = {};
  
  pedidos.forEach(pedido => {
    if (!pedido.PED_NUMPEDIDO) return;
    
    if (!pedidosAgrupados[pedido.PED_NUMPEDIDO]) {
      pedidosAgrupados[pedido.PED_NUMPEDIDO] = [];
    }
    
    pedidosAgrupados[pedido.PED_NUMPEDIDO].push(pedido);
  });
  
  return pedidosAgrupados;
}
