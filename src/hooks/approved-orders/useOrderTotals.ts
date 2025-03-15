
import { useCallback } from 'react';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './types';
import { supabase } from "@/integrations/supabase/client";

export const useOrderTotals = () => {
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
    
    // Collect all pedido numbers and item codes to fetch quantidade_entregue data
    const pedidosForFetch: {pedido: string; item_codigo: string}[] = [];
    
    // First pass - collect all pedidos and items
    for (const order of approvedOrders) {
      console.log(`calculateTotals: Processing order #${approvedOrders.indexOf(order)}:`, order.separacao_id);
      
      // Find the separação by ID
      const separacao = order.cliente_data.separacoes.find(sep => sep && sep.id === order.separacao_id);
      
      if (separacao) {
        console.log(`calculateTotals: Found separacao:`, separacao);
        
        // Process the separacao_itens_flat (if available) or fall back to separacao_itens
        const itens = separacao.separacao_itens_flat || separacao.separacao_itens || [];
        
        if (itens && itens.length > 0) {
          console.log(`calculateTotals: Processing ${itens.length} items in separacao`);
          
          itens.forEach(item => {
            // Track unique pedidos
            if (item.pedido) {
              uniquePedidos.add(item.pedido);
              
              // Add to fetch list if the item has a valid code
              if (item.item_codigo) {
                pedidosForFetch.push({
                  pedido: item.pedido,
                  item_codigo: item.item_codigo
                });
              }
            }
          });
        } else {
          console.log(`calculateTotals: No items found in separacao`);
        }
      } else {
        console.log(`calculateTotals: Could not find separacao with ID ${order.separacao_id} in order`);
      }
    }
    
    console.log('calculateTotals: Items to fetch quantidade_entregue:', pedidosForFetch);
    
    // Fetch the quantidade_entregue data from the database
    const entregaMap = {};
    
    if (pedidosForFetch.length > 0) {
      try {
        const { data: pedidoData, error } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, ITEM_CODIGO, QTDE_ENTREGUE')
          .in('PED_NUMPEDIDO', pedidosForFetch.map(item => item.pedido))
          .in('ITEM_CODIGO', pedidosForFetch.map(item => item.item_codigo));
          
        if (error) {
          console.error('Error fetching QTDE_ENTREGUE from BLUEBAY_PEDIDO:', error);
        } else {
          console.log('calculateTotals: Received quantidade_entregue data:', pedidoData);
          
          // Create a lookup map for delivered quantities
          pedidoData.forEach(row => {
            const key = `${row.PED_NUMPEDIDO}:${row.ITEM_CODIGO}`;
            entregaMap[key] = row.QTDE_ENTREGUE || 0;
          });
        }
      } catch (error) {
        console.error('Error fetching delivery data:', error);
      }
    }
    
    console.log('calculateTotals: Created entrega map:', entregaMap);
    
    // Second pass - calculate totals using the fetched data
    for (const order of approvedOrders) {
      // Find the separação by ID
      const separacao = order.cliente_data.separacoes.find(sep => sep && sep.id === order.separacao_id);
      
      if (separacao) {
        // Process the separacao_itens_flat (if available) or fall back to separacao_itens
        const itens = separacao.separacao_itens_flat || separacao.separacao_itens || [];
        
        if (itens && itens.length > 0) {
          itens.forEach(item => {
            // Calculate quantities
            const quantidade = item.quantidade_pedida || 0;
            const valorUnitario = item.valor_unitario || 0;
            
            // Use the quantidade_entregue from our lookup map or default to current value or 0
            let quantidadeEntregue = item.quantidade_entregue || 0;
            
            // If we have updated data in our entregaMap, use it
            if (item.pedido && item.item_codigo) {
              const key = `${item.pedido}:${item.item_codigo}`;
              if (entregaMap[key] !== undefined) {
                quantidadeEntregue = Number(entregaMap[key]);
              }
            }
            
            // Calculate values consistently
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
        }
      }
    }
    
    quantidadePedidos = uniquePedidos.size;
    console.log(`calculateTotals: Unique pedidos count: ${quantidadePedidos}, All pedidos: ${Array.from(uniquePedidos).join(', ')}`);
    
    console.log('calculateTotals: Final calculated totals:', { 
      valorTotal, 
      quantidadeItens, 
      quantidadePedidos, 
      valorFaltaFaturar, 
      valorFaturado
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
