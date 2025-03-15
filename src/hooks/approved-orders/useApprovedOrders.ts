
import { useState, useEffect, useCallback } from 'react';
import { useOrderTotals } from './useOrderTotals';
import { supabase } from '@/integrations/supabase/client';
import { ApprovedOrder, OrderTotals, PendingValuesState } from './types';

export const useApprovedOrders = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingValues, setPendingValues] = useState<PendingValuesState>({});
  const { calculateTotals: calculateTotalsFn } = useOrderTotals();
  const orderTotalsCalculator = useOrderTotals();

  // Convert Supabase approved_orders format to client ApprovedOrder format
  const mapSupabaseOrderToClientOrder = (order: any): ApprovedOrder => {
    return {
      ...order,
      // Map Supabase fields to client-side fields
      separacaoId: order.separacao_id,
      clienteData: order.cliente_data,
      approvedAt: new Date(order.approved_at),
      userId: order.user_id,
      userEmail: order.user_email
    };
  };

  const loadApprovedOrders = async (year: number, month: number): Promise<ApprovedOrder[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('approved_orders')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('approved_at', { ascending: false });

      if (error) {
        console.error("Error fetching approved orders:", error);
        setApprovedOrders([]);
        return [];
      } else {
        const mappedOrders = data ? data.map(mapSupabaseOrderToClientOrder) : [];
        setApprovedOrders(mappedOrders);
        return mappedOrders;
      }
    } catch (error) {
      console.error("Unexpected error loading approved orders:", error);
      setApprovedOrders([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovedOrders(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

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

    // Create a record in the format expected by Supabase
    const supabaseRecord = {
      separacao_id: separacaoId,
      cliente_data: clienteData,
      user_email: userEmail,
      user_id: userId,
      approved_at: approvedAt.toISOString(),
      year,
      month,
      action
    };

    try {
      const { data, error } = await supabase
        .from('approved_orders')
        .insert([supabaseRecord])
        .select('*');

      if (error) {
        console.error("Error adding approved order:", error);
      } else if (data && data.length > 0) {
        // Map the returned data to our client-side format
        const newOrder = mapSupabaseOrderToClientOrder(data[0]);
        setApprovedOrders(prevOrders => [...prevOrders, newOrder]);
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
      const approvedDate = new Date(order.approved_at || order.approvedAt || '');
      const orderMonth = approvedDate.getMonth() + 1; // JavaScript months are 0-indexed
      const orderYear = approvedDate.getFullYear();
      return orderMonth === selectedMonth && orderYear === selectedYear;
    });
    
    // Calculate and return totals - convert pendingValues to the expected format
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
