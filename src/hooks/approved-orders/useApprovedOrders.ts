import { useState, useEffect, useCallback } from 'react';
import { useOrderTotals } from './useOrderTotals';
import { supabase } from '@/integrations/supabase/client';
import { ApprovedOrder, OrderTotals } from './types';

export interface PendingValuesState {
  [orderId: string]: {
    volumeSaudavel: number | null;
  };
}

export const useApprovedOrders = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingValues, setPendingValues] = useState<PendingValuesState>({});
  const { calculateTotals: calculateTotalsFn } = useOrderTotals();
  const orderTotalsCalculator = useOrderTotals();

  useEffect(() => {
    loadApprovedOrders(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const loadApprovedOrders = async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('approved_orders')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('approvedAt', { ascending: false });

      if (error) {
        console.error("Error fetching approved orders:", error);
      } else {
        setApprovedOrders(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addApprovedOrder = async (
    separacaoId: string,
    clienteData: any,
    userEmail: string | null,
    userId: string | null,
    action: 'approved' | 'rejected'
  ) => {
    const approvedAt = new Date();
    const year = approvedAt.getFullYear();
    const month = approvedAt.getMonth() + 1; // JavaScript months are 0-indexed

    const newOrder = {
      separacaoId,
      clienteData,
      userEmail,
      userId,
      approvedAt,
      year,
      month,
      action
    };

    try {
      const { data, error } = await supabase
        .from('approved_orders')
        .insert([newOrder])
        .select('*');

      if (error) {
        console.error("Error adding approved order:", error);
      } else {
        setApprovedOrders(prevOrders => [...prevOrders, data[0]]);
      }
    } catch (error) {
      console.error("Unexpected error adding approved order:", error);
    }
  };

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Modify the calculateTotals function to use the async version
  const calculateTotals = useCallback(() => {
    if (isLoading) {
      return {
        valorTotal: 0,
        quantidadeItens: 0,
        quantidadePedidos: 0,
        valorFaltaFaturar: 0,
        valorFaturado: 0
      };
    }
    
    // Get the orders for the selected month
    const filteredOrders = approvedOrders.filter(order => {
      const approvedDate = new Date(order.approvedAt);
      const orderMonth = approvedDate.getMonth() + 1; // JavaScript months are 0-indexed
      const orderYear = approvedDate.getFullYear();
      return orderMonth === selectedMonth && orderYear === selectedYear;
    });
    
    // Calculate and return totals
    const result = orderTotalsCalculator.calculateTotals(filteredOrders, pendingValues);
    console.log('Calculated totals for dashboard:', result);
    return result;
  }, [approvedOrders, isLoading, selectedMonth, selectedYear, orderTotalsCalculator, pendingValues]);

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    loadApprovedOrders,
    selectedYear,
    selectedMonth,
    handleMonthSelect,
    calculateTotals
  };
};
