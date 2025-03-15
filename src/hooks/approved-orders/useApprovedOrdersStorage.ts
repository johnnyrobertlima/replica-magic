
import { useState, useCallback } from 'react';
import { ApprovedOrder } from './types';
import { 
  saveOrdersToLocalStorage, 
  loadOrdersFromLocalStorage, 
  saveOrderToSupabase,
  loadOrdersFromSupabase
} from './utils/localStorageUtils';

export const useApprovedOrdersStorage = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);

  // Load approved orders from local storage and Supabase
  const loadApprovedOrders = useCallback(async (year: number, month: number): Promise<ApprovedOrder[]> => {
    try {
      console.log(`Loading approved orders for ${year}-${month}`);
      
      // Try to load from local storage first
      const localOrders = loadOrdersFromLocalStorage(year, month);
      
      // Then try to load from Supabase
      const supabaseOrders = await loadOrdersFromSupabase(year, month);
      
      // Merge the two sources, giving priority to Supabase data
      const allOrders = [...localOrders];
      
      // Add orders from Supabase that aren't already in local storage
      for (const supabaseOrder of supabaseOrders) {
        const existingOrderIndex = allOrders.findIndex(
          order => order.separacao_id === supabaseOrder.separacao_id
        );
        
        if (existingOrderIndex === -1) {
          // If this order isn't in local storage, add it
          allOrders.push(supabaseOrder);
        }
      }
      
      // Sort orders by approved_at timestamp (newest first)
      allOrders.sort((a, b) => {
        return new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime();
      });
      
      // Update state
      setApprovedOrders(allOrders);
      return allOrders;
    } catch (error) {
      console.error('Error loading approved orders:', error);
      return [];
    }
  }, []);

  // Add a new approved order
  const addApprovedOrder = useCallback(
    async (
      separacaoId: string,
      clienteData: any,
      userEmail: string | null,
      userId: string | null,
      action: "approved" | "rejected"
    ) => {
      try {
        // Create new order object with proper types
        const newApprovedOrder: ApprovedOrder = {
          id: crypto.randomUUID(),
          separacao_id: separacaoId,
          cliente_data: clienteData,
          approved_at: new Date().toISOString(),
          user_email: userEmail || undefined,
          user_id: userId || undefined,
          action
        };
        
        // Get current month and year
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // JavaScript months are 0-indexed
        
        // Save to local storage
        setApprovedOrders(prevOrders => {
          const updatedOrders = [newApprovedOrder, ...prevOrders];
          saveOrdersToLocalStorage(updatedOrders, year, month);
          return updatedOrders;
        });
        
        // Save to Supabase in the background
        await saveOrderToSupabase(newApprovedOrder);
        
        return newApprovedOrder;
      } catch (error) {
        console.error('Error adding approved order:', error);
        return null;
      }
    },
    []
  );

  return {
    approvedOrders,
    setApprovedOrders,
    loadApprovedOrders,
    addApprovedOrder
  };
};
