
import { useState, useCallback } from 'react';
import { ApprovedOrder, PendingValuesState } from './types';
import { usePendingValuesFetcher } from './usePendingValuesFetcher';

export const useOrdersDataLoader = (loadApprovedOrders: (year: number, month: number) => Promise<ApprovedOrder[]>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingValues, setPendingValues] = useState<PendingValuesState>({});
  
  const { fetchPendingValuesForOrders } = usePendingValuesFetcher();
  
  const loadOrdersForMonth = useCallback(async (selectedYear: number, selectedMonth: number) => {
    try {
      console.log(`useOrdersDataLoader: Loading orders for ${selectedYear}-${selectedMonth}`);
      setIsLoading(true);
      
      // Load orders for the selected month
      const filteredOrders = await loadApprovedOrders(selectedYear, selectedMonth);
      console.log(`useOrdersDataLoader: Loaded ${filteredOrders.length} orders for ${selectedYear}-${selectedMonth}`, filteredOrders);
      
      // Fetch pending values
      const newPendingValues = await fetchPendingValuesForOrders(filteredOrders);
      setPendingValues(newPendingValues);
      
      return filteredOrders;
    } catch (error) {
      console.error('Error loading approved orders:', error);
      setPendingValues({});
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [loadApprovedOrders, fetchPendingValuesForOrders]);

  return {
    isLoading,
    pendingValues,
    loadOrdersForMonth
  };
};
