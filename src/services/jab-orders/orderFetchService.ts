
import { supabase } from "@/integrations/supabase/client";
import { UseJabOrdersOptions } from "@/types/jabOrders";
import { 
  clientCodeToString, 
  clientCodesToStrings 
} from "@/utils/client-orders/clientUtils";

export const fetchOrdersForClients = async (clientIds: (string | number)[], fromDate: string, toDate: string) => {
  try {
    // Convert all client IDs to strings for consistency
    const clientIdsStrings = clientCodesToStrings(clientIds);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
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
    // Get order numbers for JAB orders with filter criteria
    const { data: orderNumbersResult, error: orderNumbersError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('PED_NUMPEDIDO')
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);
      
    if (orderNumbersError) throw orderNumbersError;
    
    // We need to get unique order numbers
    const orderNumbers = orderNumbersResult || [];
    const uniqueOrderNumbers = Array.from(new Set(
      orderNumbers.map(order => order.PED_NUMPEDIDO)
    ));

    if (!uniqueOrderNumbers.length) return { orders: [], totalCount: 0 };

    // Fetch all order items
    const { data: allOrderItems, error: itemsError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);

    if (itemsError) throw itemsError;
    if (!allOrderItems) return { orders: [], totalCount: 0 };

    // Get client info
    const clientCodes = Array.from(new Set(
      allOrderItems.map(order => order.PES_CODIGO).filter(Boolean)
    ));
    const clientCodesStrings = clientCodesToStrings(clientCodes);
    
    const { data: clients, error: clientsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', clientCodesStrings);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    }

    // Get representatives info
    const repCodes = Array.from(new Set(
      allOrderItems.map(order => order.REPRESENTANTE).filter(Boolean)
    ));
    const repCodesStrings = clientCodesToStrings(repCodes);
    
    const { data: reps, error: repsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', repCodesStrings);

    if (repsError) {
      console.error('Error fetching representatives:', repsError);
    }

    // Process the orders
    const clientMap: Record<string, any> = {};
    if (clients && clients.length) {
      clients.forEach(client => {
        if (client && client.PES_CODIGO) {
          clientMap[client.PES_CODIGO] = client;
        }
      });
    }

    const repMap: Record<string, any> = {};
    if (reps && reps.length) {
      reps.forEach(rep => {
        if (rep && rep.PES_CODIGO) {
          repMap[rep.PES_CODIGO] = rep;
        }
      });
    }

    // Group order items by PED_NUMPEDIDO
    const ordersMap: Record<string, any> = {};
    
    if (allOrderItems && allOrderItems.length) {
      allOrderItems.forEach(item => {
        if (!item || !item.PED_NUMPEDIDO) return;
        
        if (!ordersMap[item.PED_NUMPEDIDO]) {
          ordersMap[item.PED_NUMPEDIDO] = {
            MATRIZ: item.MATRIZ,
            FILIAL: item.FILIAL,
            PED_NUMPEDIDO: item.PED_NUMPEDIDO,
            PED_ANOBASE: item.PED_ANOBASE,
            STATUS: item.STATUS,
            PES_CODIGO: item.PES_CODIGO,
            PEDIDO_CLIENTE: item.PEDIDO_CLIENTE,
            REPRESENTANTE: item.REPRESENTANTE,
            items: []
          };
        }
        
        // Add the item to the order's items array
        ordersMap[item.PED_NUMPEDIDO].items.push({
          ITEM_CODIGO: item.ITEM_CODIGO,
          DESCRICAO: null, // Will be filled from BLUEBAY_ITEM if needed
          QTDE_PEDIDA: item.QTDE_PEDIDA || 0,
          QTDE_ENTREGUE: item.QTDE_ENTREGUE || 0,
          QTDE_SALDO: item.QTDE_SALDO || 0,
          VALOR_UNITARIO: item.VALOR_UNITARIO || 0,
          FISICO: null // Will be filled from BLUEBAY_ESTOQUE if needed
        });
      });
    }

    // Transform the orders map to an array and calculate totals
    const processedOrders = Object.entries(ordersMap).map(([_, order]) => {
      if (!order) return null;
      
      const client = order.PES_CODIGO && clientMap[order.PES_CODIGO] 
        ? clientMap[order.PES_CODIGO] 
        : {};
        
      const rep = order.REPRESENTANTE && repMap[order.REPRESENTANTE] 
        ? repMap[order.REPRESENTANTE] 
        : {};
      
      // Calculate totals for each order
      let total_saldo = 0;
      let valor_total = 0;
      
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          total_saldo += item.QTDE_SALDO || 0;
          valor_total += (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
        });
      }

      return {
        ...order,
        APELIDO: client.APELIDO || null,
        REPRESENTANTE_NOME: rep.APELIDO || null,
        total_saldo,
        valor_total
      };
    }).filter(Boolean);

    return { 
      orders: processedOrders, 
      totalCount: processedOrders.length 
    };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }
};
