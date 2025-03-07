
import { useState, useEffect } from 'react';
import { ClienteFinanceiro } from '@/hooks/useClientesFinanceiros';

export interface ApprovedOrder {
  separacaoId: string;
  clienteData: ClienteFinanceiro;
  approvedAt: Date;
}

export const useApprovedOrders = () => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load approved orders from localStorage on initial load
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('approvedOrders');
      if (savedOrders) {
        // Convert string dates back to Date objects
        const parsedOrders = JSON.parse(savedOrders, (key, value) => {
          if (key === 'approvedAt') return new Date(value);
          return value;
        });
        setApprovedOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading approved orders from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever approvedOrders changes
  useEffect(() => {
    if (approvedOrders.length > 0) {
      localStorage.setItem('approvedOrders', JSON.stringify(approvedOrders));
    }
  }, [approvedOrders]);

  // Add a new approved order
  const addApprovedOrder = (separacaoId: string, clienteData: ClienteFinanceiro) => {
    setApprovedOrders(prevOrders => {
      // Check if order already exists
      const exists = prevOrders.some(order => order.separacaoId === separacaoId);
      if (exists) return prevOrders;
      
      // Add new order
      return [...prevOrders, {
        separacaoId,
        clienteData,
        approvedAt: new Date()
      }];
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    return approvedOrders.reduce((acc, order) => {
      // Find the separação by ID
      const separacao = order.clienteData.separacoes.find(sep => sep.id === order.separacaoId);
      if (separacao) {
        acc.valorTotal += separacao.valor_total || 0;
        acc.quantidadeItens += separacao.quantidade_itens || 0;
        acc.quantidadePedidos += 1;
      }
      return acc;
    }, { 
      valorTotal: 0, 
      quantidadeItens: 0, 
      quantidadePedidos: 0 
    });
  };

  return {
    approvedOrders,
    isLoading,
    addApprovedOrder,
    calculateTotals
  };
};
