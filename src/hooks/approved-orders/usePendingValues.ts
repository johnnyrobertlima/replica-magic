
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PendingValuesState } from './types';

export const usePendingValues = () => {
  // Fetch pending values (items that need to be invoiced) for approved orders
  const fetchPendingValues = useCallback(async (pedidoNumbers: string[]) => {
    if (pedidoNumbers.length === 0) return {};
    
    try {
      // Only fetch the pending values for the specific pedido numbers that were approved
      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, QTDE_SALDO, VALOR_UNITARIO')
        .in('PED_NUMPEDIDO', pedidoNumbers);
      
      if (error) throw error;
      
      // Calculate pending values per order
      const pendingValues = data.reduce((acc, item) => {
        const pedidoNumber = item.PED_NUMPEDIDO;
        const pendingValue = (item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0);
        
        if (!acc[pedidoNumber]) {
          acc[pedidoNumber] = 0;
        }
        
        acc[pedidoNumber] += pendingValue;
        return acc;
      }, {} as PendingValuesState);
      
      console.log('Fetched pending values:', pendingValues);
      return pendingValues;
      
    } catch (error) {
      console.error('Error fetching pending values:', error);
      return {};
    }
  }, []);

  return { fetchPendingValues };
};
