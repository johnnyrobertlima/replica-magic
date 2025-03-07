
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
    
    // Get unique pedido numbers to count properly
    const uniquePedidos = new Set<string>();
    
    // Collect all pedido numbers from the approved orders for the current month
    const pedidosAprovados: string[] = [];
    
    for (const order of approvedOrders) {
      console.log(`calculateTotals: Processing order:`, order.separacaoId);
      
      // Find the separação by ID
      const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
      
      if (separacao) {
        console.log(`calculateTotals: Found separacao:`, separacao);
        valorTotal += separacao.valor_total || 0;
        quantidadeItens += separacao.quantidade_itens || 0;
        
        console.log(`calculateTotals: Updated running totals - valorTotal: ${valorTotal}, quantidadeItens: ${quantidadeItens}`);
        
        // Calculate "Falta Faturar" directly from current database values
        if (separacao.separacao_itens && separacao.separacao_itens.length > 0) {
          console.log(`calculateTotals: Processing ${separacao.separacao_itens.length} items in separacao`);
          
          // Collect all the pedido and item codes
          const pedidoItems: {pedido: string, item: string}[] = [];
          
          for (const item of separacao.separacao_itens) {
            console.log(`calculateTotals: Adding pedido ${item.pedido} to tracking`);
            uniquePedidos.add(item.pedido);
            pedidosAprovados.push(item.pedido);
            
            if (item.item_codigo) {
              pedidoItems.push({
                pedido: item.pedido,
                item: item.item_codigo
              });
            }
          }
          
          // Fetch current values for all items at once
          if (pedidoItems.length > 0) {
            try {
              // Create an array of conditions to match pedido+item combinations
              const queries = pedidoItems.map(({pedido, item}) => 
                `(PED_NUMPEDIDO.eq.${pedido},ITEM_CODIGO.eq.${item})`
              );
              
              // Fetch current data from the database
              const { data, error } = await supabase
                .from('BLUEBAY_PEDIDO')
                .select('PED_NUMPEDIDO, ITEM_CODIGO, QTDE_SALDO, VALOR_UNITARIO')
                .or(queries.join(','));
              
              if (error) {
                console.error('Error fetching current pedido items:', error);
              } else if (data) {
                console.log('calculateTotals: Retrieved current data:', data);
                
                // Calculate falta faturar based on current data
                valorFaltaFaturar = data.reduce((sum, item) => {
                  const qtdeSaldo = Number(item.QTDE_SALDO || 0);
                  const valorUnitario = Number(item.VALOR_UNITARIO || 0);
                  const itemValue = qtdeSaldo * valorUnitario;
                  
                  console.log(`Item ${item.ITEM_CODIGO} in pedido ${item.PED_NUMPEDIDO}: Saldo=${qtdeSaldo}, Value=${itemValue}`);
                  
                  return sum + itemValue;
                }, 0);
              }
            } catch (err) {
              console.error('Error fetching current values:', err);
            }
          }
        } else {
          console.log(`calculateTotals: No items found in separacao`);
        }
      } else {
        console.log(`calculateTotals: Could not find separacao with ID ${order.separacaoId} in order`);
      }
    }
    
    quantidadePedidos = uniquePedidos.size;
    console.log(`calculateTotals: Unique pedidos count: ${quantidadePedidos}, All pedidos: ${Array.from(uniquePedidos).join(', ')}`);
    console.log(`calculateTotals: All pedidos approved (with duplicates): ${pedidosAprovados.join(', ')}`);
    
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
