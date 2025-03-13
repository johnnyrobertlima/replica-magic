
import type { UseJabOrdersOptions } from "@/types/jabOrders";
import type { ClientOrdersResult } from "./types";
import { fetchPedidosPorCliente } from "./pedidosPorClienteUtils";
import { processClientOrdersData } from "./orderProcessUtils";
import { fetchItensSeparacao } from "./separacaoUtils";

export async function fetchJabOrdersByClient({
  dateRange
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<ClientOrdersResult> {
  if (!dateRange?.from || !dateRange?.to) {
    return { clientGroups: {}, totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log(`Fetching client orders for date range: ${dataInicial} to ${dataFinal}`);

  try {
    // Fetch orders grouped by client with optimized function
    const clientesComPedidos = await fetchPedidosPorCliente(dataInicial, dataFinal);
    
    if (!clientesComPedidos || !Array.isArray(clientesComPedidos) || clientesComPedidos.length === 0) {
      console.log('No clients with orders found for the selected period');
      return { clientGroups: {}, totalCount: 0 };
    }
    
    console.log(`Found ${clientesComPedidos.length} clients with orders`);

    // Fetch separation items
    const itensSeparacao = await fetchItensSeparacao();
    
    // Process client data using optimized function
    const clientGroups = await processClientOrdersData(dataInicial, dataFinal, clientesComPedidos, itensSeparacao);

    console.log(`Processed client groups: ${Object.keys(clientGroups).length}`);
    
    return {
      clientGroups,
      totalCount: clientesComPedidos.length,
      itensSeparacao
    };
  } catch (error) {
    console.error('Error fetching client orders:', error);
    throw error;
  }
}
