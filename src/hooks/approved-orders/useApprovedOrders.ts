
import { useState, useEffect, useCallback } from 'react';
import { useApprovedOrdersStorage } from './useApprovedOrdersStorage';
import { usePendingValues } from './usePendingValues';
import { useOrderTotals } from './useOrderTotals';
import { useMonthSelection } from './useMonthSelection';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './types';

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
  
  useEffect(() => {
    const loadOrdersForMonth = async () => {
      try {
        console.log(`useApprovedOrders: Loading orders for ${selectedYear}-${selectedMonth}`);
        setIsLoading(true);
        
        const filteredOrders = loadApprovedOrders(selectedYear, selectedMonth);
        console.log(`useApprovedOrders: Loaded ${filteredOrders.length} orders for ${selectedYear}-${selectedMonth}`, filteredOrders);
        
        const uniquePedidoNumbers: string[] = [];
        const approvedItemCodes: string[] = [];
        
        filteredOrders.forEach(order => {
          const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
          if (separacao?.separacao_itens) {
            separacao.separacao_itens.forEach(item => {
              if (!uniquePedidoNumbers.includes(item.pedido)) {
                uniquePedidoNumbers.push(item.pedido);
              }
              if (item.item_codigo && !approvedItemCodes.includes(item.item_codigo)) {
                approvedItemCodes.push(item.item_codigo);
              }
            });
          }
        });
        
        console.log('useApprovedOrders: Unique pedido numbers for current month:', uniquePedidoNumbers);
        console.log('useApprovedOrders: Approved item codes for current month:', approvedItemCodes);
        
        if (uniquePedidoNumbers.length > 0) {
          console.log(`useApprovedOrders: Fetching pending values for ${uniquePedidoNumbers.length} pedidos and ${approvedItemCodes.length} item codes`);
          const pendingValuesByPedido = await fetchPendingValues(uniquePedidoNumbers, approvedItemCodes);
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
  }, [selectedYear, selectedMonth, loadApprovedOrders, fetchPendingValues]);

  const computeTotals = useCallback(async () => {
    if (!approvedOrders) {
      console.log('computeTotals: No approved orders available');
      return { 
        valorTotal: 0, 
        quantidadeItens: 0, 
        quantidadePedidos: 0,
        valorFaltaFaturar: 0,
        valorFaturado: 0
      };
    }

    const pedidoNumbers = approvedOrders.flatMap(order => {
      const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
      if (!separacao || !separacao.separacao_itens) return [];
      return separacao.separacao_itens.map(item => item.pedido);
    });

    const uniquePedidoNumbers = [...new Set(pedidoNumbers)];
    console.log('computeTotals: Unique pedido numbers:', uniquePedidoNumbers);

    const pendingValues = await fetchPendingValues(uniquePedidoNumbers);
    console.log('computeTotals: Pending values:', pendingValues);

    return await calculateTotals(approvedOrders, pendingValues);
  }, [approvedOrders, fetchPendingValues, calculateTotals]);

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    loadApprovedOrders,
    calculateTotals: computeTotals,
    handleMonthSelect,
    selectedYear,
    selectedMonth
  };
};
