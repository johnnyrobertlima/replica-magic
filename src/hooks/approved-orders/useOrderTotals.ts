
import { useCallback } from 'react';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './types';

export const useOrderTotals = () => {
  // Calculate totals - only considering items from approved orders in the current month
  const calculateTotals = useCallback((
    approvedOrders: ApprovedOrder[], 
    pendingValues: PendingValuesState
  ): OrderTotals => {
    let valorTotal = 0;
    let quantidadeItens = 0;
    let quantidadePedidos = 0;
    let valorFaltaFaturar = 0;
    
    // Get unique pedido numbers to count properly
    const uniquePedidos = new Set<string>();
    
    // Collect all pedido numbers from the approved orders for the current month
    const pedidosAprovados: string[] = [];
    
    approvedOrders.forEach(order => {
      // Find the separação by ID
      const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
      
      if (separacao) {
        valorTotal += separacao.valor_total || 0;
        quantidadeItens += separacao.quantidade_itens || 0;
        
        // Add pedidos to set and array
        separacao.separacao_itens?.forEach(item => {
          uniquePedidos.add(item.pedido);
          pedidosAprovados.push(item.pedido);
        });
      }
    });
    
    quantidadePedidos = uniquePedidos.size;
    
    // Calculate "Falta Faturar" - only using pending values for orders approved in the selected month
    if (pedidosAprovados.length > 0) {
      // Only consider pending values for orders approved in this month
      Object.entries(pendingValues).forEach(([pedido, valor]) => {
        if (pedidosAprovados.includes(pedido)) {
          valorFaltaFaturar += valor;
        }
      });
    }
    
    // Ensure valorFaturado is never negative
    const valorFaturado = Math.max(0, valorTotal - valorFaltaFaturar);
    
    console.log('Calculated totals:', { 
      valorTotal, 
      quantidadeItens, 
      quantidadePedidos, 
      valorFaltaFaturar, 
      valorFaturado,
      pedidosAprovados,
      pendingValues
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
