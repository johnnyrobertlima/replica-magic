
import { useCallback } from 'react';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './types';

export const useOrderTotals = () => {
  // Calculate totals - only considering items from approved orders in the current month
  const calculateTotals = useCallback((
    approvedOrders: ApprovedOrder[], 
    pendingValues: PendingValuesState
  ): OrderTotals => {
    console.log('calculateTotals: Starting calculation with orders:', approvedOrders);
    console.log('calculateTotals: Using pending values:', pendingValues);
    
    let valorTotal = 0;
    let quantidadeItens = 0;
    let quantidadePedidos = 0;
    let valorFaltaFaturar = 0;
    
    // Get unique pedido numbers to count properly
    const uniquePedidos = new Set<string>();
    
    // Collect all pedido numbers from the approved orders for the current month
    const pedidosAprovados: string[] = [];
    
    approvedOrders.forEach((order, index) => {
      console.log(`calculateTotals: Processing order #${index}:`, order.separacaoId);
      
      // Find the separação by ID
      const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
      
      if (separacao) {
        console.log(`calculateTotals: Found separacao:`, separacao);
        valorTotal += separacao.valor_total || 0;
        quantidadeItens += separacao.quantidade_itens || 0;
        
        console.log(`calculateTotals: Updated running totals - valorTotal: ${valorTotal}, quantidadeItens: ${quantidadeItens}`);
        
        // Calculate "Falta Faturar" directly from separacao_itens
        if (separacao.separacao_itens && separacao.separacao_itens.length > 0) {
          console.log(`calculateTotals: Processing ${separacao.separacao_itens.length} items in separacao`);
          
          separacao.separacao_itens.forEach(item => {
            console.log(`calculateTotals: Adding pedido ${item.pedido} to tracking`);
            uniquePedidos.add(item.pedido);
            pedidosAprovados.push(item.pedido);
            
            // Calculate "Falta Faturar" for each item
            const quantidade = item.quantidade_pedida || 0;
            const valorUnitario = item.valor_unitario || 0;
            const faltaFaturarItem = quantidade * valorUnitario;
            
            valorFaltaFaturar += faltaFaturarItem;
            console.log(`calculateTotals: Item falta faturar: ${faltaFaturarItem}, Running total: ${valorFaltaFaturar}`);
          });
        } else {
          console.log(`calculateTotals: No items found in separacao`);
        }
      } else {
        console.log(`calculateTotals: Could not find separacao with ID ${order.separacaoId} in order`);
      }
    });
    
    quantidadePedidos = uniquePedidos.size;
    console.log(`calculateTotals: Unique pedidos count: ${quantidadePedidos}, All pedidos: ${Array.from(uniquePedidos).join(', ')}`);
    console.log(`calculateTotals: All pedidos approved (with duplicates): ${pedidosAprovados.join(', ')}`);
    
    // We're now calculating "Falta Faturar" directly from the separacao_itens,
    // so we don't need to use pendingValues anymore as a fallback

    // Ensure valorFaturado is never negative
    const valorFaturado = Math.max(0, valorTotal - valorFaltaFaturar);
    
    console.log('calculateTotals: Final calculated totals:', { 
      valorTotal, 
      quantidadeItens, 
      quantidadePedidos, 
      valorFaltaFaturar, 
      valorFaturado,
      uniquePedidosCount: uniquePedidos.size,
      pedidosAprovados
    });
    
    return { 
      valorTotal, 
      quantidadeItens, 
      quantidadePedidos,
      valorFaltaFaturar,
      valorFaturado
    };
  }, []);

  return { calculateTotals };
};
