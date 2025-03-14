
import { useState, useCallback } from 'react';
import { ApprovedOrder } from './types';
import { 
  fetchApprovedOrdersFromSupabase, 
  processSupabaseOrders,
  saveToSupabase,
  createSimplifiedClienteData
} from './utils/supabaseUtils';
import {
  loadFromLocalStorage,
  saveToLocalStorage
} from './utils/localStorageUtils';

export const useApprovedOrdersStorage = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);

  // Load approved orders with month filtering
  const loadApprovedOrders = useCallback(async (selectedYear: number, selectedMonth: number) => {
    try {
      // Try to get from Supabase first
      const supabaseOrders = await fetchApprovedOrdersFromSupabase(selectedYear, selectedMonth);
      
      // Process Supabase orders
      const processedOrders = processSupabaseOrders(supabaseOrders);
      
      setApprovedOrders(processedOrders);
      return processedOrders;
    } catch (error) {
      console.error('Error loading from Supabase, falling back to localStorage');
      
      // Fallback to localStorage if Supabase fails
      try {
        const localStorageOrders = loadFromLocalStorage(selectedYear, selectedMonth);
        setApprovedOrders(localStorageOrders);
        return localStorageOrders;
      } catch (localStorageError) {
        console.error('Error loading from localStorage:', localStorageError);
        setApprovedOrders([]);
        return [];
      }
    }
  }, []);

  // Save to Supabase and localStorage whenever approvedOrders changes
  const addApprovedOrder = useCallback(async (
    separacaoId: string, 
    clienteData: any, // Use any to break the circular reference
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
      
      // Create simplified client data for storage
      const simplifiedClienteData = createSimplifiedClienteData(clienteData, separacaoId);
      
      // Save to Supabase
      try {
        await saveToSupabase(
          separacaoId,
          simplifiedClienteData,
          newOrder.approvedAt,
          userId,
          userEmail,
          action
        );
      } catch (error) {
        console.error('Supabase save failed, continuing with localStorage:', error);
      }
      
      // Update local state
      setApprovedOrders(prevOrders => {
        // Check if order already exists
        const exists = prevOrders.some(order => order.separacaoId === separacaoId);
        if (exists) return prevOrders;
        
        // Add new order
        const newOrders = [...prevOrders, newOrder];
        
        // Save to localStorage as backup
        saveToLocalStorage(newOrders);
        
        return newOrders;
      });
    } catch (error) {
      console.error('Error adding approved order:', error);
      // Fall back to simpler implementation
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
        saveToLocalStorage(newOrders);
        
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
