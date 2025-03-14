import { supabase } from "@/integrations/supabase/client";
import { ClientOrder, ClientOrderGroup, JabOrder } from "@/types/clientOrders";
import { formatCurrency } from "@/lib/utils";

// Function to group orders by client
export const groupOrdersByClient = async (ordersData: { orders: JabOrder[]; totalCount: number; itensSeparacao: Record<string, any>; }): Promise<Record<string, ClientOrderGroup>> => {
  const { orders } = ordersData;
  const groupedOrders: Record<string, ClientOrderGroup> = {};
  const clientCodes: any[] = [];

  for (const order of orders) {
    const clientName = order.CLI_NOME;
    const clientCode = order.PES_CODIGO;

    if (!clientCodes.find(cli => cli.PES_CODIGO === clientCode)) {
      clientCodes.push({ PES_CODIGO: clientCode, CLI_NOME: clientName });
    }

    if (!groupedOrders[clientName]) {
      groupedOrders[clientName] = {
        clientCode: clientCode,
        clientName: clientName,
        orders: [],
        totalValorFaturarComEstoque: 0,
        totalValorSaldo: 0,
        totalItens: 0,
        valorVencido: 0,
        titulosVencidos: 0,
      };
    }

    const valorFaturarComEstoque = order.VALOR_FATURAR_COM_ESTOQUE || 0;
    const valorSaldo = order.VALOR_SALDO || 0;

    groupedOrders[clientName].orders.push(order);
    groupedOrders[clientName].totalValorFaturarComEstoque += valorFaturarComEstoque;
    groupedOrders[clientName].totalValorSaldo += valorSaldo;
    groupedOrders[clientName].totalItens += 1;
  }

  const overdueMap = await fetchClientOverdueStatus(clientCodes);

  for (const clientName in groupedOrders) {
    const clientCode = String(groupedOrders[clientName].clientCode);
    if (overdueMap[clientCode]) {
      groupedOrders[clientName].valorVencido = overdueMap[clientCode].valorVencido;
      groupedOrders[clientName].titulosVencidos = overdueMap[clientCode].titulosVencidos;
    } else {
      groupedOrders[clientName].valorVencido = 0;
      groupedOrders[clientName].titulosVencidos = 0;
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
    
    // Fetch overdue titles from Supabase
    const { data, error } = await supabase
      .from('vw_titulos_vencidos_por_cliente')
      .select('*')
      .in('cliente_id', uniqueClientCodes);
    
    if (error) {
      console.error("Error fetching overdue titles:", error);
      return {};
    }
    
    // Create a map of client codes to their overdue status
    const overdueMap: Record<string, { valorVencido: number; titulosVencidos: number }> = {};
    
    data.forEach(item => {
      const clientId = String(item.cliente_id);
      overdueMap[clientId] = {
        valorVencido: item.valor_vencido || 0,
        titulosVencidos: item.titulos_vencidos || 0
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
            return group.orders.some(order => String(order.PED_NUMERO).includes(normalizedSearchQuery));
          case "cliente":
            return clientName.toLowerCase().includes(normalizedSearchQuery);
          case "representante":
            return group.orders.some(order =>
              order.REP_NOME?.toLowerCase().includes(normalizedSearchQuery)
            );
          default:
            return false;
        }
      })
  );
};
