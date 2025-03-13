
/**
 * Processes client orders data into a structured format
 * Uses the optimized database functions
 */
import { fetchItensPorCliente, fetchEstoqueParaItens } from "../clientDataService";

export async function processClientOrdersData(
  dataInicial: string,
  dataFinal: string,
  clientesComPedidos: any[],
  itensSeparacao: Record<string, boolean>,
  batchSize: number = 5,
  limitResults: boolean = false
): Promise<Record<string, any>> {
  console.log(`Processing order data for ${clientesComPedidos.length} clients with batch size ${batchSize}`);
  const clientGroups: Record<string, any> = {};
  
  // NUNCA limitar resultados
  if (limitResults) {
    console.warn('AVISO: limitResults está ativado, mas será IGNORADO para garantir que todos os resultados sejam exibidos');
  }
  
  // Create a map of client codes to client names for quick lookup
  // This helps ensure we don't miss any clients due to name formatting issues
  const clienteCodigoParaNome = new Map();
  clientesComPedidos.forEach(cliente => {
    // Handle undefined client names 
    const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
    clienteCodigoParaNome.set(cliente.pes_codigo, clienteName);
  });
  
  console.log(`DIAGNOSTIC LOG: Created client code to name mapping for ${clienteCodigoParaNome.size} clients`);
  
  // Process clients in batches to avoid memory issues with large datasets
  const totalBatches = Math.ceil(clientesComPedidos.length / batchSize);
  console.log(`Will process data in ${totalBatches} batches`);
  
  // Tracking for processed clients
  let successfullyProcessed = 0;
  let failedToProcess = 0;
  const failedClientCodes = new Set();
  
  for (let i = 0; i < clientesComPedidos.length; i += batchSize) {
    const batch = clientesComPedidos.slice(i, i + batchSize);
    const currentBatch = Math.floor(i / batchSize) + 1;
    console.log(`Processing batch ${currentBatch}/${totalBatches} with ${batch.length} clients`);
    
    const batchResults = await Promise.allSettled(batch.map(async (cliente) => {
      try {
        // Get client name, ensuring we have a fallback
        const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
        const representanteName = cliente.representante_nome || 'Não informado';
        const pedidosDistintosDoBanco = cliente.total_pedidos_distintos || 0;
        const clienteCodigo = cliente.pes_codigo;
        
        // Debug info for each client
        console.log(`DIAGNOSTIC LOG: Processing client: ${clienteName} (${clienteCodigo}) - ${pedidosDistintosDoBanco} pedidos no banco`);
        
        // Add client to groups even before fetching items
        // This ensures we don't lose clients just because they might not have items
        clientGroups[clienteName] = {
          PES_CODIGO: clienteCodigo,
          representante: representanteName,
          representante_codigo: cliente.representante_codigo,
          totalQuantidadeSaldo: 0,
          totalValorSaldo: 0,
          totalValorPedido: 0,
          totalValorFaturado: 0,
          totalValorFaturarComEstoque: 0,
          volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
          allItems: [],
          uniquePedidosCount: 0,
          total_pedidos_distintos: pedidosDistintosDoBanco
        };
        
        // Fetch client items using optimized function
        console.log(`Fetching items for client ${clienteName} (${clienteCodigo})`);
        const itensCliente = await fetchItensPorCliente(dataInicial, dataFinal, clienteCodigo);
        
        if (itensCliente && Array.isArray(itensCliente) && itensCliente.length > 0) {
          console.log(`Found ${itensCliente.length} items for client ${clienteName}`);
          
          // Count unique orders for this client
          const uniquePedidos = new Set(itensCliente.map(item => item.pedido));
          console.log(`Client ${clienteName} has ${uniquePedidos.size} unique orders from items`);
          console.log(`Database reported ${pedidosDistintosDoBanco} unique orders for client ${clienteName}`);
          
          // NUNCA limitar itens a processar
          const itensProcessar = itensCliente;
          
          // Fetch stock information for items
          const itemCodigos = itensProcessar.map(item => item.item_codigo);
          console.log(`Fetching stock info for ${itemCodigos.length} items`);
          const estoqueData = await fetchEstoqueParaItens(itemCodigos);
          
          if (Array.isArray(estoqueData)) {
            console.log(`Got stock info for ${estoqueData.length} items`);
            const estoqueMap = new Map(estoqueData.map(e => [e.item_codigo, e.fisico]));
            
            // Initialize tracking variables for client totals
            let totalQuantidadeSaldo = 0;
            let totalValorSaldo = 0;
            let totalValorPedido = 0;
            let totalValorFaturado = 0;
            let totalValorFaturarComEstoque = 0;
            
            // Process items with stock information
            const itensProcessados = itensProcessar.map(item => {
              const estoqueDisponivel = estoqueMap.get(item.item_codigo) || 0;
              const emSeparacao = itensSeparacao[item.item_codigo] || false;
              
              // Get item properties
              const qtdePedida = item.qtde_pedida || 0;
              const qtdeEntregue = item.qtde_entregue || 0;
              const qtdeSaldo = item.qtde_saldo || 0;
              const valorUnitario = item.valor_unitario || 0;
              
              // Calculate values
              const valorTotalPedido = qtdePedida * valorUnitario;
              const valorTotalSaldo = qtdeSaldo * valorUnitario;
              const valorFaturado = qtdeEntregue * valorUnitario;
              
              // Determine if the item can be billed with available stock
              const valorFaturarComEstoque = (estoqueDisponivel > 0 && qtdeSaldo > 0) ? valorTotalSaldo : 0;
              
              // Update client totals
              totalQuantidadeSaldo += qtdeSaldo;
              totalValorSaldo += valorTotalSaldo;
              totalValorPedido += valorTotalPedido;
              totalValorFaturado += valorFaturado;
              totalValorFaturarComEstoque += valorFaturarComEstoque;
              
              return {
                ...item,
                fisico: estoqueDisponivel,
                emSeparacao,
                valor_total_pedido: valorTotalPedido,
                valor_total_saldo: valorTotalSaldo,
                valor_faturado: valorFaturado,
                valor_faturar_com_estoque: valorFaturarComEstoque
              };
            });
            
            // Update client group with processed items and totals
            clientGroups[clienteName] = {
              ...clientGroups[clienteName],
              totalQuantidadeSaldo,
              totalValorSaldo,
              totalValorPedido,
              totalValorFaturado,
              totalValorFaturarComEstoque,
              allItems: itensProcessados,
              uniquePedidosCount: uniquePedidos.size
            };
            
            // Log discrepancies
            if (uniquePedidos.size !== pedidosDistintosDoBanco) {
              console.warn(`DISCREPÂNCIA: Cliente ${clienteName} - ${pedidosDistintosDoBanco} pedidos no banco vs ${uniquePedidos.size} calculados pelos itens`);
            }
          }
        } else {
          console.log(`No items found for client ${clienteName} (${clienteCodigo}), keeping basic entry`);
        }
        
        successfullyProcessed++;
        return { success: true, clientName: clienteName, clienteCodigo };
      } catch (error) {
        console.error(`Error processing client ${cliente.pes_codigo}:`, error);
        failedToProcess++;
        failedClientCodes.add(cliente.pes_codigo);
        
        // Despite the error, add a basic entry for this client to ensure it appears in the UI
        try {
          const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
          const representanteName = cliente.representante_nome || 'Não informado';
          const pedidosDistintosDoBanco = cliente.total_pedidos_distintos || 0;
          
          // Add a basic client record even when there's an error
          clientGroups[clienteName] = {
            PES_CODIGO: cliente.pes_codigo,
            representante: representanteName,
            representante_codigo: cliente.representante_codigo,
            totalQuantidadeSaldo: 0,
            totalValorSaldo: 0,
            totalValorPedido: 0,
            totalValorFaturado: 0,
            totalValorFaturarComEstoque: 0,
            volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
            allItems: [],
            uniquePedidosCount: 0,
            total_pedidos_distintos: pedidosDistintosDoBanco
          };
          
          console.log(`Added basic entry for client ${clienteName} despite processing error`);
          return { success: false, clientName: clienteName, error, recoveryAttempted: true };
        } catch (recoveryError) {
          console.error(`Failed to add basic client entry for ${cliente.pes_codigo}:`, recoveryError);
          return { success: false, clientName: cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`, error, recoveryAttempted: false };
        }
      }
    }));
    
    // Log batch results
    const batchSuccesses = batchResults.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const batchFails = batchResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)).length;
    const batchRecoveries = batchResults.filter(r => r.status === 'fulfilled' && !r.value?.success && r.value?.recoveryAttempted).length;
    
    console.log(`Batch ${currentBatch} results: ${batchSuccesses} successes, ${batchFails} failures (${batchRecoveries} recovered)`);
    console.log(`Current client groups count: ${Object.keys(clientGroups).length}`);
  }
  
  console.log(`Processing complete: ${successfullyProcessed} clients processed successfully, ${failedToProcess} failures`);
  console.log(`Final client groups count: ${Object.keys(clientGroups).length}`);
  
  // Now check for any clients in the database that are missing from our processed results
  // This helps catch any clients we might have missed due to processing errors or bugs
  console.log("DIAGNOSTIC LOG: Checking for clients that may have been missed during processing");
  let missingClientsAdded = 0;
  
  for (const cliente of clientesComPedidos) {
    const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
    if (!clientGroups[clienteName]) {
      console.warn(`DIAGNOSTIC LOG: Client ${clienteName} (${cliente.pes_codigo}) is missing from processed results, adding basic entry`);
      
      // Add a basic entry for this client
      clientGroups[clienteName] = {
        PES_CODIGO: cliente.pes_codigo,
        representante: cliente.representante_nome || 'Não informado',
        representante_codigo: cliente.representante_codigo,
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
        allItems: [],
        uniquePedidosCount: 0,
        total_pedidos_distintos: cliente.total_pedidos_distintos || 0
      };
      
      missingClientsAdded++;
    }
  }
  
  if (missingClientsAdded > 0) {
    console.log(`DIAGNOSTIC LOG: Added ${missingClientsAdded} clients that were missing from processed results`);
  }
  
  // Final verification count
  const finalClientCount = Object.keys(clientGroups).length;
  console.log(`DIAGNOSTIC LOG: Final client count: ${finalClientCount} (expected ${clientesComPedidos.length})`);
  
  if (finalClientCount !== clientesComPedidos.length) {
    console.error(`DIAGNOSTIC ERROR: Still missing ${clientesComPedidos.length - finalClientCount} clients after all processing`);
    
    // Compare the two sets to find which clients are still missing
    const processedClientNames = new Set(Object.keys(clientGroups));
    const missingClientNames = clientesComPedidos
      .map(c => c.cliente_nome || `Cliente ${c.pes_codigo}`)
      .filter(name => !processedClientNames.has(name));
    
    console.error(`DIAGNOSTIC ERROR: Missing clients: ${JSON.stringify(missingClientNames)}`);
  }
  
  return clientGroups;
}
