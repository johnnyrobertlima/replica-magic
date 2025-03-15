
import { useState, useEffect, useCallback } from 'react';
import { useApprovedOrdersStorage } from './useApprovedOrdersStorage';
import { useOrderTotals } from './useOrderTotals';
import { useMonthSelection } from './useMonthSelection';
import { useOrdersDataLoader } from './useOrdersDataLoader';
import { ApprovedOrder, OrderTotals } from './types';

export const useApprovedOrders = () => {
  const { 
    approvedOrders, 
    setApprovedOrders, 
    loadApprovedOrders, 
    addApprovedOrder 
  } = useApprovedOrdersStorage();
  
  const { calculateTotals } = useOrderTotals();
  const { selectedYear, selectedMonth, handleMonthSelect } = useMonthSelection();
  
  const { 
    isLoading, 
    pendingValues, 
    loadOrdersForMonth 
  } = useOrdersDataLoader(loadApprovedOrders);
  
  // Load approved orders when month selection changes
  useEffect(() => {
    const loadData = async () => {
      await loadOrdersForMonth(selectedYear, selectedMonth);
    };
    
    loadData();
  }, [selectedYear, selectedMonth, loadOrdersForMonth]);

  const calculateTotalsWrapper = useCallback(async () => {
    console.log('useApprovedOrders: Calling calculateTotals with', {
      approvedOrdersCount: approvedOrders.length,
      pendingValuesCount: Object.keys(pendingValues).length,
      pendingValues
    });
    
    return await calculateTotals(approvedOrders, pendingValues);
  }, [approvedOrders, pendingValues, calculateTotals]);

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    loadApprovedOrders,
    calculateTotals: calculateTotalsWrapper,
    handleMonthSelect,
    selectedYear,
    selectedMonth
  };
};
