
import { supabase } from "@/integrations/supabase/client";
import { ClientOrderGroup, JabOrder } from "@/types/clientOrders";
import { formatCurrency } from "@/lib/utils";

// Function to group orders by client
export const groupOrdersByClient = async (ordersData: { orders: JabOrder[]; totalCount: number; itensSeparacao: Record<string, any>; }): Promise<Record<string, ClientOrderGroup>> => {
  const { orders } = ordersData;
  const groupedOrders: Record<string, ClientOrderGroup> = {};
  const clientCodes: any[] = [];

  for (const order of orders) {
    const clientName = order.APELIDO || `Cliente ${order.PES_CODIGO}`;
    const clientCode = order.PES_CODIGO;

    if (!clientCodes.find(cli => cli.PES_CODIGO === clientCode)) {
      clientCodes.push({ PES_CODIGO: clientCode, CLI_NOME: clientName });
    }

    if (!groupedOrders[clientName]) {
      groupedOrders[clientName] = {
        PES_CODIGO: clientCode,
        pedidos: [],
        allItems: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: null,
        valorVencido: 0,
        quantidadeTitulosVencidos: 0,
      };
    }

    groupedOrders[clientName].pedidos.push(order);

    // Add items to the allItems array
    if (order.items) {
      for (const item of order.items) {
        groupedOrders[clientName].allItems.push({
          ...item,
          pedido: order.PED_NUMPEDIDO,
          APELIDO: order.APELIDO,
          PES_CODIGO: order.PES_CODIGO
        });
        
        // Update the calculations based on the new requirements
        groupedOrders[clientName].totalQuantidadeSaldo += item.QTDE_SALDO;
        groupedOrders[clientName].totalValorSaldo += item.QTDE_SALDO * item.VALOR_UNITARIO;
        groupedOrders[clientName].totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
        groupedOrders[clientName].totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
        
        // For "Faturar com Estoque", only count if the physical quantity is > 0
        if ((item.FISICO || 0) > 0) {
          groupedOrders[clientName].totalValorFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
        }
      }
    }
  }

  const overdueMap = await fetchClientOverdueStatus(clientCodes);

  for (const clientName in groupedOrders) {
    const clientCode = String(groupedOrders[clientName].PES_CODIGO);
    if (overdueMap[clientCode]) {
      groupedOrders[clientName].valorVencido = overdueMap[clientCode].valorVencido;
      groupedOrders[clientName].quantidadeTitulosVencidos = overdueMap[clientCode].titulosVencidos;
    } else {
      groupedOrders[clientName].valorVencido = 0;
      groupedOrders[clientName].quantidadeTitulosVencidos = 0;
    }
  }

  return groupedOrders;
};

// Function to fetch client overdue status
export const fetchClientOverdueStatus = async (clientCodes: any[]) => {
  try {
    // Extract unique client codes
    const uniqueClientCodes = [...new Set(clientCodes.map(client => String(client.PES_CODIGO)))];
    
    if (uniqueClientCodes.length === 0) {
      console.log("No client codes to check for overdue status");
      return {};
    }

    console.log(`Fetching overdue status for ${uniqueClientCodes.length} clients`);
    
    // Fetch overdue titles from Supabase using the correct view name
    const { data, error } = await supabase
      .from('vw_titulos_vencidos_cliente')
      .select('*')
      .in('PES_CODIGO', uniqueClientCodes);
    
    if (error) {
      console.error("Error fetching overdue titles:", error);
      return {};
    }
    
    // Create a map of client codes to their overdue status
    const overdueMap: Record<string, { valorVencido: number; titulosVencidos: number }> = {};
    
    data.forEach(item => {
      const clientId = String(item.PES_CODIGO);
      overdueMap[clientId] = {
        valorVencido: item.total_vencido || 0,
        titulosVencidos: item.quantidade_titulos || 0
      };
    });
    
    return overdueMap;
  } catch (error) {
    console.error("Error in fetchClientOverdueStatus:", error);
    return {};
  }
};

// Function to filter groups by search criteria
export const filterGroupsBySearchCriteria = (
  groups: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: string
): Record<string, ClientOrderGroup> => {
  if (!isSearching) {
    return groups;
  }

  const normalizedSearchQuery = searchQuery.toLowerCase();

  return Object.fromEntries(
    Object.entries(groups)
      .filter(([clientName, group]) => {
        if (!normalizedSearchQuery) return true;

        switch (searchType) {
          case "pedido":
            return group.pedidos.some(order => String(order.PED_NUMPEDIDO).includes(normalizedSearchQuery));
          case "cliente":
            return clientName.toLowerCase().includes(normalizedSearchQuery);
          case "representante":
            return group.pedidos.some(order => {
              const repName = order.REPRESENTANTE_NOME;
              return repName && typeof repName === 'string' && repName.toLowerCase().includes(normalizedSearchQuery);
            });
          default:
            return false;
        }
      })
  );
};
