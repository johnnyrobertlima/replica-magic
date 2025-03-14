
import { useState, useCallback } from 'react';
import { ApprovedOrder, MonthSelection } from './types';
import { ClienteFinanceiro } from '@/types/financialClient';
import { supabase } from '@/integrations/supabase/client';

// Define a fully flattened type structure to avoid circular references
type StoredClienteData = {
  PES_CODIGO: number;
  APELIDO: string | null;
  volume_saudavel_faturamento: number | null;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  representanteNome: string | null;
  // Store only minimal required data
  separacoes: Array<{
    id: string;
    valor_total: number | null;
    quantidade_itens: number | null;
    // Simplify the structure completely
    separacao_itens_flat: Array<{
      pedido: string;
      item_codigo: string | null;
      quantidade_pedida: number | null;
      valor_unitario: number | null;
    }> | null;
  }>;
};

export const useApprovedOrdersStorage = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);

  // Load approved orders with month filtering
  const loadApprovedOrders = useCallback(async (selectedYear: number, selectedMonth: number) => {
    try {
      // Try to get from Supabase first
      const { data: supabaseOrders, error } = await supabase
        .from('approved_orders')
        .select('*')
        .eq('approved_at::text', `${selectedYear}-%${selectedMonth < 10 ? '0' : ''}${selectedMonth}-%`)
        .order('approved_at', { ascending: false });

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
      
      // Create flattened version of clienteData for storage
      const simplifiedClienteData: StoredClienteData = {
        PES_CODIGO: clienteData.PES_CODIGO,
        APELIDO: clienteData.APELIDO,
        volume_saudavel_faturamento: clienteData.volume_saudavel_faturamento,
        valoresTotais: clienteData.valoresTotais,
        valoresEmAberto: clienteData.valoresEmAberto,
        valoresVencidos: clienteData.valoresVencidos,
        representanteNome: clienteData.representanteNome,
        separacoes: clienteData.separacoes.map(sep => {
          if (sep.id === separacaoId) {
            return {
              id: sep.id,
              valor_total: sep.valor_total || null,
              quantidade_itens: sep.quantidade_itens || null,
              // Flatten separacao_itens to avoid deep nesting
              separacao_itens_flat: sep.separacao_itens ? 
                sep.separacao_itens.map(item => ({
                  pedido: item.pedido,
                  item_codigo: item.item_codigo || null,
                  quantidade_pedida: item.quantidade_pedida || null,
                  valor_unitario: item.valor_unitario || null
                })) : null
            };
          }
          return { 
            id: sep.id, 
            valor_total: null, 
            quantidade_itens: null, 
            separacao_itens_flat: null 
          };
        })
      };
      
      // Save to Supabase with simplified data
      const { error } = await supabase
        .from('approved_orders')
        .insert({
          separacao_id: separacaoId,
          cliente_data: simplifiedClienteData,
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
