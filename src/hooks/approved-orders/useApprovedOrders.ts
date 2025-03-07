
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
        setIsLoading(true);
        
        // Load orders for the selected month
        const filteredOrders = loadApprovedOrders(selectedYear, selectedMonth);
        setApprovedOrders(filteredOrders);
        
        // Get all pedido numbers from the filtered orders
        const uniquePedidoNumbers = Array.from(new Set(
          filteredOrders.flatMap(order => {
            const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
            return separacao?.separacao_itens?.map(item => item.pedido) || [];
          })
        ));
        
        console.log('Unique pedido numbers for current month:', uniquePedidoNumbers);
        
        // Fetch and set pending values ONLY for the current month's approved orders
        if (uniquePedidoNumbers.length > 0) {
          const pendingValuesByPedido = await fetchPendingValues(uniquePedidoNumbers);
          setPendingValues(pendingValuesByPedido);
        } else {
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
    calculateTotals: () => calculateTotals(approvedOrders, pendingValues),
    handleMonthSelect,
    selectedYear,
    selectedMonth
  };
};
