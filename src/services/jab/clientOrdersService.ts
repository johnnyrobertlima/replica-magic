
import type { UseJabOrdersOptions } from "@/types/jabOrders";
import type { ClientOrdersResult } from "./types";
import { fetchPedidosPorCliente } from "./fetching/clientOrdersFetcher";
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
    
    // Contar o número total de pedidos distintos
    let totalPedidosDistintos = 0;
    clientesComPedidos.forEach(cliente => {
      if (cliente.total_pedidos_distintos) {
        totalPedidosDistintos += cliente.total_pedidos_distintos;
      }
    });
    
    console.log(`Found ${clientesComPedidos.length} clients with orders`);
    console.log(`Total distinct orders according to database: ${totalPedidosDistintos}`);
    console.log(`This should match the expected 450 orders`);

    // Fetch separation items
    const itensSeparacao = await fetchItensSeparacao();
    
    // Adjust batch size for optimal processing based on date range
    // Usar batchSize menor para intervalos de datas maiores
    const batchSize = Math.max(1, Math.min(5, Math.floor(100 / Math.max(1, daysDifference))));
    console.log(`Using batch size: ${batchSize} for processing client data`);
    
    // Process client data - NEVER limit results
    const clientGroups = await processClientOrdersData(
      dataInicial, 
      dataFinal, 
      clientesComPedidos, 
      itensSeparacao,
      batchSize,
      false // Always disable the limiting of results!
    );

    // Double check the number of clients processed
    const processedClientCount = Object.keys(clientGroups).length;
    console.log(`Processed ${processedClientCount} clients out of ${clientesComPedidos.length} from database`);
    
    if (processedClientCount !== clientesComPedidos.length) {
      console.error(`WARNING: We lost ${clientesComPedidos.length - processedClientCount} clients during processing!`);
    }
    
    // After processing, verify the total orders processed
    let pedidosProcessados = 0;
    Object.values(clientGroups).forEach((client: any) => {
      if (client.uniquePedidosCount) {
        pedidosProcessados += client.uniquePedidosCount;
      } else if (client.total_pedidos_distintos) {
        pedidosProcessados += client.total_pedidos_distintos;
      }
    });

    console.log(`Total distinct orders after processing: ${pedidosProcessados}`);
    console.log(`Total received from database: ${totalPedidosDistintos}`);
    
    // Log discrepancies if any
    if (pedidosProcessados !== totalPedidosDistintos) {
      console.warn(`IMPORTANTE: Discrepância entre pedidos do banco (${totalPedidosDistintos}) e processados (${pedidosProcessados})`);
    }
    
    return {
      clientGroups,
      totalCount: totalPedidosDistintos, // Use a contagem de pedidos distintos do banco
      itensSeparacao
    };
  } catch (error) {
    console.error('Error fetching client orders:', error);
    throw error;
  }
}
