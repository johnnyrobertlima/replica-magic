
import { useState, useCallback } from 'react';
import { ApprovedOrder, MonthSelection } from './types';
import { ClienteFinanceiro } from '@/types/financialClient';
import { supabase } from '@/integrations/supabase/client';

export const useApprovedOrdersStorage = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);

  // Load approved orders with month filtering
  const loadApprovedOrders = useCallback(async (selectedYear: number, selectedMonth: number) => {
    try {
      // Try to get from Supabase first
      const { data: supabaseOrders, error } = await supabase
        .from('approved_orders')
        .select('*')
        .eq('extract(year from approved_at)', selectedYear)
        .eq('extract(month from approved_at)', selectedMonth);

      if (error) {
        console.error('Error loading approved orders from Supabase:', error);
        
        // Fallback to localStorage if Supabase fails
        const savedOrders = localStorage.getItem('approvedOrders');
        
        if (savedOrders) {
          // Convert string dates back to Date objects
          const allOrders = JSON.parse(savedOrders, (key, value) => {
            if (key === 'approvedAt') return new Date(value);
            return value;
          }) as ApprovedOrder[];
          
          // Filter by selected month and year
          const filteredOrders = allOrders.filter(order => {
            const approvalDate = new Date(order.approvedAt);
            return approvalDate.getFullYear() === selectedYear && 
                   approvalDate.getMonth() + 1 === selectedMonth;
          });
          
          setApprovedOrders(filteredOrders);
          return filteredOrders;
        }
        
        setApprovedOrders([]);
        return [];
      }
      
      // Process Supabase orders
      const processedOrders = supabaseOrders.map(order => ({
        separacaoId: order.separacao_id,
        clienteData: order.cliente_data as unknown as ClienteFinanceiro,
        approvedAt: new Date(order.approved_at),
        userId: order.user_id,
        userEmail: order.user_email,
        action: order.action
      }));
      
      setApprovedOrders(processedOrders);
      return processedOrders;
    } catch (error) {
      console.error('Error loading approved orders:', error);
      setApprovedOrders([]);
      return [];
    }
  }, []);

  // Save to Supabase and localStorage whenever approvedOrders changes
  const addApprovedOrder = useCallback(async (
    separacaoId: string, 
    clienteData: ClienteFinanceiro, 
    userEmail: string | null = null,
    userId: string | null = null,
    action: string = 'approved'
  ) => {
    try {
      // Create new order object
      const newOrder = {
        separacaoId,
        clienteData,
        approvedAt: new Date(),
        userId,
        userEmail,
        action
      };
      
      // Save to Supabase - convert clienteData to a JSON object
      const { error } = await supabase
        .from('approved_orders')
        .insert({
          separacao_id: separacaoId,
          cliente_data: clienteData as any, // Cast to any to avoid type issues
          approved_at: newOrder.approvedAt.toISOString(),
          user_id: userId,
          user_email: userEmail,
          action: action
        });
      
      if (error) {
        console.error('Error saving to Supabase:', error);
        // Continue with localStorage as fallback
      }
      
      // Update local state
      setApprovedOrders(prevOrders => {
        // Check if order already exists
        const exists = prevOrders.some(order => order.separacaoId === separacaoId);
        if (exists) return prevOrders;
        
        // Add new order
        const newOrders = [...prevOrders, newOrder];
        
        // Save to localStorage as backup
        localStorage.setItem('approvedOrders', JSON.stringify(newOrders));
        
        return newOrders;
      });
    } catch (error) {
      console.error('Error adding approved order:', error);
      // Fall back to previous implementation
      setApprovedOrders(prevOrders => {
        const exists = prevOrders.some(order => order.separacaoId === separacaoId);
        if (exists) return prevOrders;
        
        const newOrder = {
          separacaoId,
          clienteData,
          approvedAt: new Date(),
          userId,
          userEmail,
          action
        };
        
        const newOrders = [...prevOrders, newOrder];
        localStorage.setItem('approvedOrders', JSON.stringify(newOrders));
        
        return newOrders;
      });
    }
  }, []);

  return {
    approvedOrders,
    setApprovedOrders,
    loadApprovedOrders,
    addApprovedOrder
  };
};
