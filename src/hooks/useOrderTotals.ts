
import { useCallback } from 'react';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './approved-orders/types';
import { supabase } from "@/integrations/supabase/client";

export const useOrderTotals = () => {
  // Fetch delivery quantities for all items in approved orders
  const fetchDeliveryQuantities = useCallback(async (approvedOrders: ApprovedOrder[]) => {
    // Collect all pedido numbers and item codes
    const itemsToFetch = [];
    
    for (const order of approvedOrders) {
      if (!order.clienteData || !order.clienteData.separacoes) continue;
      
      const separacao = order.clienteData.separacoes.find(sep => sep && sep.id === order.separacaoId);
      if (!separacao || !separacao.separacao_itens_flat) continue;
      
      for (const item of separacao.separacao_itens_flat) {
        if (item && item.pedido && item.item_codigo) {
          itemsToFetch.push({
            pedido: item.pedido,
            item_codigo: item.item_codigo
          });
        }
      }
    }
    
    if (itemsToFetch.length === 0) return {};
    
    // Fetch the data from BLUEBAY_PEDIDO based on order numbers and item codes
    try {
      const { data: pedidoData, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, ITEM_CODIGO, QTDE_ENTREGUE')
        .in('PED_NUMPEDIDO', itemsToFetch.map(item => item.pedido))
        .in('ITEM_CODIGO', itemsToFetch.map(item => item.item_codigo));
      
      if (error) {
        console.error('Error fetching QTDE_ENTREGUE from BLUEBAY_PEDIDO:', error);
        return {};
      }
      
      // Create a map of PED_NUMPEDIDO+ITEM_CODIGO to QTDE_ENTREGUE for easy lookup
      const entregaMap = {};
      pedidoData.forEach(row => {
        const key = `${row.PED_NUMPEDIDO}:${row.ITEM_CODIGO}`;
        entregaMap[key] = row.QTDE_ENTREGUE;
      });
      
      return entregaMap;
    } catch (error) {
      console.error('Error in fetchDeliveryQuantities:', error);
      return {};
    }
  }, []);

  // Calculate totals - only considering items from approved orders in the current month
  const calculateTotals = useCallback(async (
    approvedOrders: ApprovedOrder[], 
    pendingValues: PendingValuesState
  ): Promise<OrderTotals> => {
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
    
    // Fetch all delivery quantities in a single query
    const entregaMap = await fetchDeliveryQuantities(approvedOrders);
    
    approvedOrders.forEach((order, index) => {
      console.log(`calculateTotals: Processing order #${index}:`, order.separacaoId);
      
      // Find the separação by ID
      const separacao = order.clienteData.separacoes.find(sep => sep && sep.id === order.separacaoId);
      
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
            
            // Get quantidade_entregue from our fetched map when possible
            let quantidadeEntregue = 0;
            if (item.pedido && item.item_codigo) {
              const key = `${item.pedido}:${item.item_codigo}`;
              quantidadeEntregue = entregaMap[key] !== undefined ? entregaMap[key] : (item.quantidade_entregue || 0);
            } else {
              quantidadeEntregue = item.quantidade_entregue || 0;
            }
            
            // Calculate values consistently with PedidosIncluidos.tsx and ApprovedOrderCard.tsx
            const itemValorTotal = quantidade * valorUnitario;
            const itemValorFaturado = quantidadeEntregue * valorUnitario;
            const itemValorFaltaFaturar = itemValorTotal - itemValorFaturado;
            
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
  }, [fetchDeliveryQuantities]);

  return { calculateTotals };
};
