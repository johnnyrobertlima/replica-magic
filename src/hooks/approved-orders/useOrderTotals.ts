
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
    let valorFaturado = 0;
    
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
        
        // Process the separacao_itens_flat (if available) or fall back to separacao_itens
        const itens = separacao.separacao_itens_flat || separacao.separacao_itens || [];
        
        if (itens && itens.length > 0) {
          console.log(`calculateTotals: Processing ${itens.length} items in separacao`);
          
          itens.forEach(item => {
            // Track unique pedidos
            if (item.pedido) {
              console.log(`calculateTotals: Adding pedido ${item.pedido} to tracking`);
              uniquePedidos.add(item.pedido);
              pedidosAprovados.push(item.pedido);
            }
            
            // Calculate quantities
            const quantidade = item.quantidade_pedida || 0;
            const valorUnitario = item.valor_unitario || 0;
            const quantidadeEntregue = item.quantidade_entregue || 0;
            const saldo = item.quantidade_saldo || (quantidade - quantidadeEntregue);
            
            // Calculate values using same logic as in ApprovedOrderCard
            const itemValorTotal = quantidade * valorUnitario;
            const itemValorFaltaFaturar = saldo * valorUnitario;
            const itemValorFaturado = quantidadeEntregue * valorUnitario;
            
            // Add to totals
            valorTotal += itemValorTotal;
            valorFaltaFaturar += itemValorFaltaFaturar;
            valorFaturado += itemValorFaturado;
            
            // Count this as one item
            quantidadeItens += 1;
            
            console.log(`calculateTotals: Item values - Total: ${itemValorTotal}, Falta Faturar: ${itemValorFaltaFaturar}, Faturado: ${itemValorFaturado}`);
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
