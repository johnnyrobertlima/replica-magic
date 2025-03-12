
import { supabase } from "@/integrations/supabase/client";
import { UseJabOrdersOptions } from "@/types/jabOrders";
import { clientCodeToString } from "@/utils/client-orders/clientUtils";

export const fetchOrdersForClients = async (clientIds: (string | number)[], fromDate: string, toDate: string) => {
  try {
    const clientIdsStrings = clientIds.map(clientCodeToString);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*, items:BLUEBAY_PEDIDO(*)')
      .in('PES_CODIGO', clientIdsStrings)
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return { success: false, error };
  }
};

export const fetchAllJabOrders = async (options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>) => {
  const fromDate = options.dateRange?.from?.toISOString() || '';
  const toDate = options.dateRange?.to?.toISOString() || '';

  try {
    const { data: orders, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select(`
        *,
        items:BLUEBAY_ITEMPEDIDO(
          ITEM_CODIGO,
          DESCRICAO,
          QTDE_SALDO,
          QTDE_PEDIDA,
          QTDE_ENTREGUE,
          VALOR_UNITARIO,
          FISICO
        )
      `)
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);

    if (error) throw error;

    return { 
      orders: orders?.map(order => ({
        ...order,
        items: order.items || [], // Ensure items is always an array
        total_saldo: order.items?.reduce((acc, item) => acc + (item.QTDE_SALDO || 0), 0) || 0,
        valor_total: order.items?.reduce((acc, item) => acc + ((item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0)), 0) || 0
      })) || [],
      totalCount: orders?.length || 0 
    };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }
};
