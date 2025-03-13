
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
  
  console.log('Processando todos os pedidos sem limitação');
  
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
        const pedidosDistintosDoBanco = cliente.total_pedidos_distintos || 0;
        
        // Debug para TODOS os clientes
        console.log(`Cliente: ${clienteName} (${cliente.pes_codigo}) - ${pedidosDistintosDoBanco} pedidos no banco`);
        
        // Fetch client items using optimized function
        console.log(`Fetching items for client ${clienteName} (${cliente.pes_codigo})`);
        const itensCliente = await fetchItensPorCliente(dataInicial, dataFinal, cliente.pes_codigo);
        
        if (itensCliente && Array.isArray(itensCliente) && itensCliente.length > 0) {
          console.log(`Found ${itensCliente.length} items for client ${clienteName}`);
          
          // Count unique orders for this client
          const uniquePedidos = new Set(itensCliente.map(item => item.pedido));
          console.log(`Client ${clienteName} has ${uniquePedidos.size} unique orders from items`);
          console.log(`Database reported ${pedidosDistintosDoBanco} unique orders`);
          
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
            
            // Add client group - use the total_pedidos_distintos from database as source of truth
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
              uniquePedidosCount: uniquePedidos.size,
              total_pedidos_distintos: pedidosDistintosDoBanco
            };
            
            // Log discrepancies
            if (uniquePedidos.size !== pedidosDistintosDoBanco) {
              console.warn(`DISCREPÂNCIA: Cliente ${clienteName} - ${pedidosDistintosDoBanco} pedidos no banco vs ${uniquePedidos.size} calculados pelos itens`);
            }
          }
        } else {
          console.log(`No items found for client ${clienteName} (${cliente.pes_codigo})`);
          
          // Adicionar cliente mesmo sem itens, mantendo a contagem de pedidos do banco
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
        }
      } catch (error) {
        console.error(`Error processing client ${cliente.pes_codigo}:`, error);
      }
    }));
    
    console.log(`Completed batch ${currentBatch}/${totalBatches}. Current client groups: ${Object.keys(clientGroups).length}`);
  }
  
  // Contar pedidos únicos após processamento
  let totalPedidosDistintosProcessados = 0;
  let totalPedidosDistintosBanco = 0;
  Object.values(clientGroups).forEach((client: any) => {
    if (client.uniquePedidosCount) {
      totalPedidosDistintosProcessados += client.uniquePedidosCount;
    }
    if (client.total_pedidos_distintos) {
      totalPedidosDistintosBanco += client.total_pedidos_distintos;
    }
  });
  
  console.log(`Finished processing all clients. Total client groups: ${Object.keys(clientGroups).length}`);
  console.log(`Total pedidos distintos calculados pelos itens: ${totalPedidosDistintosProcessados}`);
  console.log(`Total pedidos distintos conforme banco de dados: ${totalPedidosDistintosBanco}`);
  
  return clientGroups;
}
