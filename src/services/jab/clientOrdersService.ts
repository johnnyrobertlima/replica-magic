
import type { UseJabOrdersOptions } from "@/types/jabOrders";
import type { ClientOrdersResult } from "./types";
import { fetchPedidosPorCliente } from "./fetching/clientOrdersFetcher";
import { processClientOrdersData } from "./processing/clientOrdersProcessor";
import { fetchItensSeparacao } from "./separacaoUtils";
import { toast } from "@/components/ui/use-toast";

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
    console.log("DIAGNOSTIC LOG: About to fetch client orders from database");
    const clientesComPedidos = await fetchPedidosPorCliente(dataInicial, dataFinal);
    console.log("DIAGNOSTIC LOG: Completed fetchPedidosPorCliente");
    
    if (!clientesComPedidos || !Array.isArray(clientesComPedidos) || clientesComPedidos.length === 0) {
      console.log('No clients with orders found for the selected period');
      return { clientGroups: {}, totalCount: 0 };
    }
    
    // Count total unique pedidos from the database
    let totalPedidosDistintos = 0;
    const clientesPorCodigo = new Map();
    
    clientesComPedidos.forEach(cliente => {
      if (cliente.total_pedidos_distintos) {
        totalPedidosDistintos += cliente.total_pedidos_distintos;
      }
      // Store clients by code to check for duplicates
      clientesPorCodigo.set(cliente.pes_codigo, cliente);
    });
    
    console.log(`DIAGNOSTIC LOG: Found ${clientesComPedidos.length} clients with orders from database`);
    console.log(`DIAGNOSTIC LOG: Database reports ${totalPedidosDistintos} total distinct orders`);
    
    // Check for and log potential duplicate clients
    if (clientesPorCodigo.size !== clientesComPedidos.length) {
      console.warn(`DIAGNOSTIC WARNING: Found ${clientesComPedidos.length} client records but only ${clientesPorCodigo.size} unique client codes`);
    }
    
    // Log all database clients for comparison
    console.log(`DIAGNOSTIC LOG: All clients from database (${clientesComPedidos.length}):`);
    const clienteNomes = clientesComPedidos.map(c => c.cliente_nome || `Cliente ${c.pes_codigo}`);
    console.log(JSON.stringify(clienteNomes));

    // Fetch separation items
    const itensSeparacao = await fetchItensSeparacao();
    
    // Adjust batch size for optimal processing based on date range
    // Usar batchSize menor para intervalos de datas maiores
    const batchSize = Math.max(1, Math.min(5, Math.floor(100 / Math.max(1, daysDifference))));
    console.log(`Using batch size: ${batchSize} for processing client data`);
    
    // Process client data - NEVER limit results
    console.log("DIAGNOSTIC LOG: About to process client data with processClientOrdersData");
    const clientGroups = await processClientOrdersData(
      dataInicial, 
      dataFinal, 
      clientesComPedidos, 
      itensSeparacao,
      batchSize,
      false // Always disable the limiting of results!
    );
    console.log("DIAGNOSTIC LOG: Completed processClientOrdersData");

    // Double check the number of clients processed
    const processedClientCount = Object.keys(clientGroups).length;
    console.log(`DIAGNOSTIC LOG: Processed ${processedClientCount} clients out of ${clientesComPedidos.length} from database`);
    
    // Log all processed client names for comparison
    console.log(`DIAGNOSTIC LOG: All processed clients (${processedClientCount}):`);
    console.log(JSON.stringify(Object.keys(clientGroups)));
    
    if (processedClientCount !== clientesComPedidos.length) {
      console.error(`ERROR: We lost ${clientesComPedidos.length - processedClientCount} clients during processing!`);
      
      // Let's check which clients are missing
      console.log("DIAGNOSTIC LOG: Looking for missing clients...");
      const processedClientNames = new Set(Object.keys(clientGroups));
      
      // Find clients that were in the database but missing from processed results
      const missingClients = clientesComPedidos.filter(cliente => {
        const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
        return !processedClientNames.has(clienteName);
      });
      
      console.log(`DIAGNOSTIC LOG: Found ${missingClients.length} missing clients, showing below:`);
      missingClients.forEach((cliente, idx) => {
        console.log(`${idx + 1}. Missing client: ${cliente.cliente_nome || 'NO NAME'} (${cliente.pes_codigo}): ${cliente.total_pedidos_distintos} orders`);
      });
      
      // Show toast with error information - using destructive variant instead of warning
      toast({
        title: "Erro ao processar clientes",
        description: `${missingClients.length} clientes não foram processados corretamente.`,
        variant: "destructive", 
      });
    }
    
    // Log discrepancies if any
    const totalPedidosProcessados = Object.values(clientGroups).reduce((acc: number, client: any) => {
      return acc + (client.total_pedidos_distintos || 0);
    }, 0);
    
    console.log(`DIAGNOSTIC LOG: Total distinct orders after processing: ${totalPedidosProcessados}`);
    console.log(`DIAGNOSTIC LOG: Total received from database: ${totalPedidosDistintos}`);
    
    if (totalPedidosProcessados !== totalPedidosDistintos) {
      console.warn(`IMPORTANTE: Discrepância entre pedidos do banco (${totalPedidosDistintos}) e processados (${totalPedidosProcessados})`);
    }
    
    return {
      clientGroups,
      totalCount: totalPedidosDistintos, // Use a contagem de pedidos distintos do banco
      itensSeparacao
    };
  } catch (error) {
    console.error('Error fetching client orders:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Show toast with error information
    toast({
      title: "Erro ao buscar pedidos",
      description: "Ocorreu um erro ao buscar os pedidos dos clientes.",
      variant: "destructive",
    });
    
    throw error;
  }
}
