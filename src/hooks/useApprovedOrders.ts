
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ClienteFinanceiro } from '@/types/financialClient';

export interface ApprovedOrder {
  separacaoId: string;
  clienteData: ClienteFinanceiro;
  approvedAt: Date;
}

interface OrderTotals {
  valorTotal: number;
  quantidadeItens: number;
  quantidadePedidos: number;
  valorFaltaFaturar: number;
  valorFaturado: number;
}

export const useApprovedOrders = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingValues, setPendingValues] = useState<Record<string, number>>({});
  
  // Handle month selection
  const handleMonthSelect = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);
  
  // Fetch pending values (items that need to be invoiced) for approved orders
  const fetchPendingValues = useCallback(async (pedidoNumbers: string[]) => {
    if (pedidoNumbers.length === 0) return {};
    
    try {
      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, QTDE_SALDO, VALOR_UNITARIO')
        .in('PED_NUMPEDIDO', pedidoNumbers);
      
      if (error) throw error;
      
      // Calculate pending values per order
      return data.reduce((acc, item) => {
        const pedidoNumber = item.PED_NUMPEDIDO;
        const pendingValue = (item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0);
        
        if (!acc[pedidoNumber]) {
          acc[pedidoNumber] = 0;
        }
        
        acc[pedidoNumber] += pendingValue;
        return acc;
      }, {} as Record<string, number>);
      
    } catch (error) {
      console.error('Error fetching pending values:', error);
      return {};
    }
  }, []);
  
  // Load approved orders with month filtering
  useEffect(() => {
    const loadApprovedOrders = async () => {
      try {
        setIsLoading(true);
        
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
          
          setApprovedOrders(filteredOrders);
          
          // Fetch pending values for the filtered orders
          const uniquePedidoNumbers = Array.from(new Set(
            filteredOrders.flatMap(order => {
              const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
              return separacao?.separacao_itens?.map(item => item.pedido) || [];
            })
          ));
          
          const pendingValuesByPedido = await fetchPendingValues(uniquePedidoNumbers);
          setPendingValues(pendingValuesByPedido);
        } else {
          setApprovedOrders([]);
        }
      } catch (error) {
        console.error('Error loading approved orders from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApprovedOrders();
  }, [selectedYear, selectedMonth, fetchPendingValues]);

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

  // Calculate totals
  const calculateTotals = useCallback((): OrderTotals => {
    let valorTotal = 0;
    let quantidadeItens = 0;
    let quantidadePedidos = 0;
    let valorFaltaFaturar = 0;
    
    // Get unique pedido numbers to count properly
    const uniquePedidos = new Set<string>();
    
    approvedOrders.forEach(order => {
      // Find the separação by ID
      const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
      
      if (separacao) {
        valorTotal += separacao.valor_total || 0;
        quantidadeItens += separacao.quantidade_itens || 0;
        
        // Add pedidos to set to count unique pedidos
        separacao.separacao_itens?.forEach(item => {
          uniquePedidos.add(item.pedido);
          
          // Add pending values
          const pendingValue = pendingValues[item.pedido] || 0;
          valorFaltaFaturar += pendingValue;
        });
      }
    });
    
    quantidadePedidos = uniquePedidos.size;
    
    // Calculate valor faturado (approved value minus pending value)
    const valorFaturado = Math.max(0, valorTotal - valorFaltaFaturar);
    
    return { 
      valorTotal, 
      quantidadeItens, 
      quantidadePedidos,
      valorFaltaFaturar,
      valorFaturado
    };
  }, [approvedOrders, pendingValues]);

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    calculateTotals,
    handleMonthSelect,
    selectedYear,
    selectedMonth
  };
};
