
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PendingValuesState } from './types';

export const usePendingValues = () => {
  // Fetch pending values (items that need to be invoiced) for approved orders
  const fetchPendingValues = useCallback(async (pedidoNumbers: string[]) => {
    if (pedidoNumbers.length === 0) {
      console.log('fetchPendingValues: No pedido numbers provided, returning empty object');
      return {};
    }
    
    console.log('fetchPendingValues: Called with pedido numbers:', pedidoNumbers);
    
    try {
      // Only fetch the pending values for the specific pedido numbers that were approved
      console.log('fetchPendingValues: Querying Supabase for pedidos:', pedidoNumbers);
      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, QTDE_SALDO, VALOR_UNITARIO')
        .in('PED_NUMPEDIDO', pedidoNumbers);
      
      if (error) {
        console.error('fetchPendingValues: Supabase error:', error);
        throw error;
      }
      
      console.log('fetchPendingValues: Raw data from Supabase:', data);
      
      // Calculate pending values per order
      const pendingValues = data.reduce((acc, item) => {
        const pedidoNumber = item.PED_NUMPEDIDO;
        const qtdeSaldo = item.QTDE_SALDO || 0;
        const valorUnitario = item.VALOR_UNITARIO || 0;
        const pendingValue = qtdeSaldo * valorUnitario;
        
        console.log(`fetchPendingValues: Processing item - Pedido: ${pedidoNumber}, Saldo: ${qtdeSaldo}, Valor: ${valorUnitario}, Pending Value: ${pendingValue}`);
        
        if (!acc[pedidoNumber]) {
          acc[pedidoNumber] = 0;
        }
        
        acc[pedidoNumber] += pendingValue;
        console.log(`fetchPendingValues: Accumulated value for ${pedidoNumber}: ${acc[pedidoNumber]}`);
        return acc;
      }, {} as PendingValuesState);
      
      console.log('fetchPendingValues: Final pending values:', pendingValues);
      return pendingValues;
      
    } catch (error) {
      console.error('Error fetching pending values:', error);
      return {};
    }
  }, []);

  return { fetchPendingValues };
};
