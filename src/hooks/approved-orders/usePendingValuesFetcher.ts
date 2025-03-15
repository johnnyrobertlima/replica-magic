
import { useCallback } from 'react';
import { usePendingValues } from './usePendingValues';
import { ApprovedOrder } from './types';

export const usePendingValuesFetcher = () => {
  const { fetchPendingValues } = usePendingValues();
  
  const fetchPendingValuesForOrders = useCallback(async (filteredOrders: ApprovedOrder[]) => {
    // Get all pedido numbers and item codes from the filtered orders
    const uniquePedidoNumbers: string[] = [];
    const approvedItemCodes: string[] = [];
    
    filteredOrders.forEach(order => {
      const separacao = order.cliente_data.separacoes.find(sep => sep.id === order.separacao_id);
      if (separacao?.separacao_itens_flat) {
        separacao.separacao_itens_flat.forEach(item => {
          if (!uniquePedidoNumbers.includes(item.pedido)) {
            uniquePedidoNumbers.push(item.pedido);
          }
          if (item.item_codigo && !approvedItemCodes.includes(item.item_codigo)) {
            approvedItemCodes.push(item.item_codigo);
          }
        });
      }
    });
    
    console.log('usePendingValuesFetcher: Unique pedido numbers for current month:', uniquePedidoNumbers);
    console.log('usePendingValuesFetcher: Approved item codes for current month:', approvedItemCodes);
    
    // Fetch and set pending values ONLY for the current month's approved items
    if (uniquePedidoNumbers.length > 0) {
      console.log(`usePendingValuesFetcher: Fetching pending values for ${uniquePedidoNumbers.length} pedidos and ${approvedItemCodes.length} item codes`);
      const pendingValuesByPedido = await fetchPendingValues(uniquePedidoNumbers, approvedItemCodes);
      console.log('usePendingValuesFetcher: Returned pending values:', pendingValuesByPedido);
      return pendingValuesByPedido;
    } else {
      console.log('usePendingValuesFetcher: No pedidos found, returning empty pending values');
      return {};
    }
  }, [fetchPendingValues]);

  return { fetchPendingValuesForOrders };
};
