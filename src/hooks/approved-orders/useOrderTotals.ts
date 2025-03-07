
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
        
        // Add pedidos to set and array
        if (separacao.separacao_itens && separacao.separacao_itens.length > 0) {
          console.log(`calculateTotals: Processing ${separacao.separacao_itens.length} items in separacao`);
          
          separacao.separacao_itens.forEach(item => {
            console.log(`calculateTotals: Adding pedido ${item.pedido} to tracking`);
            uniquePedidos.add(item.pedido);
            pedidosAprovados.push(item.pedido);
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
    
    // Calculate "Falta Faturar" - only using pending values for orders approved in the selected month
    if (pedidosAprovados.length > 0) {
      console.log(`calculateTotals: Calculating "Falta Faturar" for ${pedidosAprovados.length} approved pedidos`);
      
      // Only consider pending values for orders approved in this month
      Object.entries(pendingValues).forEach(([pedido, valor]) => {
        console.log(`calculateTotals: Checking pedido ${pedido} with pending value ${valor}`);
        
        if (pedidosAprovados.includes(pedido)) {
          console.log(`calculateTotals: Pedido ${pedido} is in approved list, adding ${valor} to valorFaltaFaturar`);
          valorFaltaFaturar += valor;
        } else {
          console.log(`calculateTotals: Pedido ${pedido} is NOT in approved list, skipping`);
        }
      });
    } else {
      console.log(`calculateTotals: No approved pedidos found, "Falta Faturar" will be 0`);
    }
    
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
