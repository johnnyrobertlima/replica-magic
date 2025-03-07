
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PendingValuesState } from './types';

export const usePendingValues = () => {
  // Fetch pending values (items that need to be invoiced) for approved orders
  const fetchPendingValues = useCallback(async (
    pedidoNumbers: string[],
    itemCodigos: string[] = []
  ) => {
    if (pedidoNumbers.length === 0) {
      console.log('fetchPendingValues: No pedido numbers provided, returning empty object');
      return {};
    }
    
    console.log('fetchPendingValues: Called with pedido numbers:', pedidoNumbers);
    console.log('fetchPendingValues: Filtering by item codes:', itemCodigos);
    
    try {
      let query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, QTDE_SALDO, VALOR_UNITARIO, ITEM_CODIGO, QTDE_PEDIDA')
        .in('PED_NUMPEDIDO', pedidoNumbers);
      
      // If specific item codes are provided, filter by those too
      if (itemCodigos.length > 0) {
        console.log('fetchPendingValues: Adding ITEM_CODIGO filter for', itemCodigos.length, 'items');
        query = query.in('ITEM_CODIGO', itemCodigos);
      }
      
      console.log('fetchPendingValues: Executing query');
      const { data, error } = await query;
      
      if (error) {
        console.error('fetchPendingValues: Supabase error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('fetchPendingValues: No data returned from query');
        return {};
      }
      
      console.log('fetchPendingValues: Raw data from Supabase:', data);
      console.log('fetchPendingValues: Retrieved', data.length, 'items from database');
      
      // Calculate pending values per order with improved null checking
      const pendingValues = data.reduce((acc, item) => {
        if (!item) return acc;
        
        const pedidoNumber = item.PED_NUMPEDIDO;
        const itemCodigo = item.ITEM_CODIGO;
        const qtdeSaldo = Number(item.QTDE_SALDO || 0);
        const valorUnitario = Number(item.VALOR_UNITARIO || 0);
        const pendingValue = qtdeSaldo * valorUnitario;
        
        console.log(`fetchPendingValues: Processing item - Pedido: ${pedidoNumber}, Item: ${itemCodigo}, Saldo: ${qtdeSaldo}, Valor: ${valorUnitario}, Pending Value: ${pendingValue}`);
        
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
