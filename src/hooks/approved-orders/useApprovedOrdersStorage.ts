
import { useState, useCallback } from 'react';
import { ApprovedOrder, MonthSelection } from './types';
import { ClienteFinanceiro } from '@/types/financialClient';

export const useApprovedOrdersStorage = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);

  // Load approved orders with month filtering
  const loadApprovedOrders = useCallback((selectedYear: number, selectedMonth: number) => {
    try {
      // Get from localStorage first
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
        
        return filteredOrders;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading approved orders from localStorage:', error);
      return [];
    }
  }, []);

  // Save to localStorage whenever approvedOrders changes
  const addApprovedOrder = useCallback((separacaoId: string, clienteData: ClienteFinanceiro) => {
    setApprovedOrders(prevOrders => {
      // Check if order already exists
      const exists = prevOrders.some(order => order.separacaoId === separacaoId);
      if (exists) return prevOrders;
      
      // Add new order
      const newOrders = [...prevOrders, {
        separacaoId,
        clienteData,
        approvedAt: new Date()
      }];
      
      // Save to localStorage
      localStorage.setItem('approvedOrders', JSON.stringify(newOrders));
      
      return newOrders;
    });
  }, []);

  return {
    approvedOrders,
    setApprovedOrders,
    loadApprovedOrders,
    addApprovedOrder
  };
};
