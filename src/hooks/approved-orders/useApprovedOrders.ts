
import { useState, useEffect } from 'react';
import { useApprovedOrdersStorage } from './useApprovedOrdersStorage';
import { useOrderTotals } from './useOrderTotals';
import { useMonthSelection } from './useMonthSelection';
import { useOrdersDataLoader } from './useOrdersDataLoader';
import { ApprovedOrder } from './types';

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

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    loadApprovedOrders,
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
