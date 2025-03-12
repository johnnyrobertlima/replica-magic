
import { supabase } from "@/integrations/supabase/client";
import { UseJabOrdersOptions } from "@/types/jabOrders";
import { clientCodeToString, clientCodeToNumber } from "@/utils/client-orders/clientUtils";

export const fetchOrdersForClients = async (clientIds: (string | number)[], fromDate: string, toDate: string) => {
  try {
    // Convert all client IDs to numbers for consistency
    const clientIdsNumbers = clientIds.map(clientCodeToNumber);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .in('PES_CODIGO', clientIdsNumbers)
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
    // Get distinct PED_NUMPEDIDO values to identify unique orders
    const { data: orderNumbers, error: orderNumbersError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('PED_NUMPEDIDO')
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate)
      .order('PED_NUMPEDIDO')
      .distinct();

    if (orderNumbersError) throw orderNumbersError;
    if (!orderNumbers) return { orders: [], totalCount: 0 };

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
    const clientCodes = Array.from(new Set(allOrderItems.map(order => order.PES_CODIGO).filter(Boolean)));
    const clientCodesNumbers = clientCodes.map(clientCodeToNumber);
    
    const { data: clients, error: clientsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', clientCodesNumbers);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    }

    // Get representatives info
    const repCodes = Array.from(new Set(allOrderItems.map(order => order.REPRESENTANTE).filter(Boolean)));
    const repCodesNumbers = repCodes.map(clientCodeToNumber);
    
    const { data: reps, error: repsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', repCodesNumbers);

    if (repsError) {
      console.error('Error fetching representatives:', repsError);
    }

    // Process the orders
    const clientMap = clients ? clients.reduce((map, client) => {
      map[client.PES_CODIGO] = client;
      return map;
    }, {}) : {};

    const repMap = reps ? reps.reduce((map, rep) => {
      map[rep.PES_CODIGO] = rep;
      return map;
    }, {}) : {};

    // Group order items by PED_NUMPEDIDO
    const ordersMap = {};
    allOrderItems.forEach(item => {
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

    // Transform the orders map to an array and calculate totals
    const processedOrders = Object.values(ordersMap).map(order => {
      const client = clientMap[order.PES_CODIGO] || {};
      const rep = repMap[order.REPRESENTANTE] || {};
      
      // Calculate totals for each order
      let total_saldo = 0;
      let valor_total = 0;
      
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
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
    });

    return { 
      orders: processedOrders, 
      totalCount: processedOrders.length 
    };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }
};
