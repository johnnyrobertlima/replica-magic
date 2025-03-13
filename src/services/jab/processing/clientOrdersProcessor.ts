
/**
 * Processes client orders data into a structured format
 * Uses the optimized database functions
 */
import { fetchItensPorCliente, fetchEstoqueParaItens } from "../pedidosPorClienteUtils";

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
  
  // Process clients in batches to avoid memory issues with large datasets
  const totalBatches = Math.ceil(clientesComPedidos.length / batchSize);
  console.log(`Will process data in ${totalBatches} batches`);
  
  for (let i = 0; i < clientesComPedidos.length; i += batchSize) {
    const batch = clientesComPedidos.slice(i, i + batchSize);
    const currentBatch = Math.floor(i / batchSize) + 1;
    console.log(`Processing batch ${currentBatch}/${totalBatches} with ${batch.length} clients`);
    
    await Promise.all(batch.map(async (cliente) => {
      try {
        const clienteName = cliente.cliente_nome || `Cliente ${cliente.pes_codigo}`;
        const representanteName = cliente.representante_nome || 'Não informado';
        
        // Buscar itens do cliente com a função otimizada
        console.log(`Fetching items for client ${clienteName} (${cliente.pes_codigo})`);
        const itensCliente = await fetchItensPorCliente(dataInicial, dataFinal, cliente.pes_codigo);
        
        if (itensCliente && Array.isArray(itensCliente) && itensCliente.length > 0) {
          console.log(`Found ${itensCliente.length} items for client ${clienteName}`);
          
          // Check if we need to limit results for this client (for very large datasets)
          // IMPORTANT: We've disabled this limiter for now as per user requirements
          let itensProcessar = itensCliente;
          if (limitResults && itensCliente.length > 1000) {
            console.log(`Limiting items for client ${clienteName} due to large dataset (${itensCliente.length} -> 1000)`);
            itensProcessar = itensCliente.slice(0, 1000);
          } else {
            console.log(`Processing all ${itensCliente.length} items for client ${clienteName}`);
          }
          
          // Buscar informações de estoque para os itens com a função otimizada
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
            
            // Count unique pedidos for this client
            const uniquePedidos = new Set();
            itensProcessar.forEach(item => uniquePedidos.add(item.pedido));
            console.log(`Client ${clienteName} has ${uniquePedidos.size} unique orders`);
            
            // Processar itens com informações de estoque
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
              
              // Determinar se o item pode ser faturado com estoque
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
            
            // Adicionar grupo de cliente
            clientGroups[clienteName] = {
              PES_CODIGO: cliente.pes_codigo,
              representante: representanteName,
              representante_codigo: cliente.representante_codigo,
              totalQuantidadeSaldo,
              totalValorSaldo,
              totalValorPedido,
              totalValorFaturado,
              totalValorFaturarComEstoque,
              volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
              allItems: itensProcessados,
              uniquePedidosCount: uniquePedidos.size, // Add this to track the number of unique orders
            };
          }
        } else {
          console.log(`No items found for client ${clienteName} (${cliente.pes_codigo})`);
        }
      } catch (error) {
        console.error(`Error processing client ${cliente.pes_codigo}:`, error);
      }
    }));
    
    console.log(`Completed batch ${currentBatch}/${totalBatches}. Current client groups: ${Object.keys(clientGroups).length}`);
  }
  
  console.log(`Finished processing all clients. Total client groups: ${Object.keys(clientGroups).length}`);
  return clientGroups;
}
