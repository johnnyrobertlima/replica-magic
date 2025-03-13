
import type { UseJabOrdersOptions } from "@/types/jabOrders";
import type { ClientOrdersResult } from "./types";
import { fetchPedidosPorCliente } from "./clientDataService";
import { processClientOrdersData } from "./processing/clientOrdersProcessor";
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
    
    // Fetch all clients with orders - NO LIMITS
    const clientesComPedidos = await fetchPedidosPorCliente(dataInicial, dataFinal);
    
    if (!clientesComPedidos || !Array.isArray(clientesComPedidos) || clientesComPedidos.length === 0) {
      console.log('No clients with orders found for the selected period');
      return { clientGroups: {}, totalCount: 0 };
    }
    
    console.log(`Found ${clientesComPedidos.length} clients with orders`);

    // Fetch separation items
    const itensSeparacao = await fetchItensSeparacao();
    
    // Process client data - adjust batch size for optimal processing based on date range
    // For larger date ranges, use smaller batch sizes to avoid memory issues
    const batchSize = daysDifference > 100 ? 2 : (daysDifference > 30 ? 3 : 5);
    console.log(`Using batch size: ${batchSize} for processing client data`);
    
    const clientGroups = await processClientOrdersData(
      dataInicial, 
      dataFinal, 
      clientesComPedidos, 
      itensSeparacao,
      batchSize,
      false // Always disable the limiting of results!
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
