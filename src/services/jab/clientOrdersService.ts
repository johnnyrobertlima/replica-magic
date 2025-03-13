
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
    // First, check how large is the date range in days
    const startDate = new Date(dataInicial);
    const endDate = new Date(dataFinal);
    const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    console.log(`Date range spans ${daysDifference} days`);
    
    // For very large date ranges, we need to use a different approach
    // since the database function might time out or return too much data
    const clientesComPedidos = await fetchPedidosPorCliente(dataInicial, dataFinal);
    
    if (!clientesComPedidos || !Array.isArray(clientesComPedidos) || clientesComPedidos.length === 0) {
      console.log('No clients with orders found for the selected period');
      return { clientGroups: {}, totalCount: 0 };
    }
    
    console.log(`Found ${clientesComPedidos.length} clients with orders`);

    // Fetch separation items
    const itensSeparacao = await fetchItensSeparacao();
    
    // Process client data using optimized function with a higher batch size for large date ranges
    const batchSize = daysDifference > 90 ? 3 : 5; // Reduce batch size for large date ranges
    console.log(`Using batch size: ${batchSize} for processing client data`);
    
    const clientGroups = await processClientOrdersData(
      dataInicial, 
      dataFinal, 
      clientesComPedidos, 
      itensSeparacao,
      batchSize
    );

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
