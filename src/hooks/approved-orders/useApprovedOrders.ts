
import { useState, useEffect } from 'react';
import { useApprovedOrdersStorage } from './useApprovedOrdersStorage';
import { usePendingValues } from './usePendingValues';
import { useOrderTotals } from './useOrderTotals';
import { useMonthSelection } from './useMonthSelection';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './types';
import { ClienteFinanceiro } from '@/types/financialClient';

export const useApprovedOrders = () => {
  const { 
    approvedOrders, 
    setApprovedOrders, 
    loadApprovedOrders, 
    addApprovedOrder 
  } = useApprovedOrdersStorage();
  
  const { fetchPendingValues } = usePendingValues();
  const { calculateTotals } = useOrderTotals();
  const { selectedYear, selectedMonth, handleMonthSelect } = useMonthSelection();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pendingValues, setPendingValues] = useState<PendingValuesState>({});
  
  // Load approved orders when month selection changes
  useEffect(() => {
    const loadOrdersForMonth = async () => {
      try {
        console.log(`useApprovedOrders: Loading orders for ${selectedYear}-${selectedMonth}`);
        setIsLoading(true);
        
        // Load orders for the selected month
        const filteredOrders = loadApprovedOrders(selectedYear, selectedMonth);
        console.log(`useApprovedOrders: Loaded ${filteredOrders.length} orders for ${selectedYear}-${selectedMonth}`, filteredOrders);
        setApprovedOrders(filteredOrders);
        
        // Get all pedido numbers from the filtered orders
        const uniquePedidoNumbers = Array.from(new Set(
          filteredOrders.flatMap(order => {
            const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
            return separacao?.separacao_itens?.map(item => item.pedido) || [];
          })
        ));
        
        console.log('useApprovedOrders: Unique pedido numbers for current month:', uniquePedidoNumbers);
        
        // Fetch and set pending values ONLY for the current month's approved orders
        if (uniquePedidoNumbers.length > 0) {
          console.log(`useApprovedOrders: Fetching pending values for ${uniquePedidoNumbers.length} pedidos`);
          const pendingValuesByPedido = await fetchPendingValues(uniquePedidoNumbers);
          console.log('useApprovedOrders: Setting pending values:', pendingValuesByPedido);
          setPendingValues(pendingValuesByPedido);
        } else {
          console.log('useApprovedOrders: No pedidos found, setting empty pending values');
          setPendingValues({});
        }
      } catch (error) {
        console.error('Error loading approved orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrdersForMonth();
  }, [selectedYear, selectedMonth, loadApprovedOrders, fetchPendingValues, setApprovedOrders]);

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    calculateTotals: () => {
      console.log('useApprovedOrders: Calling calculateTotals with', {
        approvedOrdersCount: approvedOrders.length,
        pendingValuesCount: Object.keys(pendingValues).length,
        pendingValues
      });
      return calculateTotals(approvedOrders, pendingValues);
    },
    handleMonthSelect,
    selectedYear,
    selectedMonth
  };
};
