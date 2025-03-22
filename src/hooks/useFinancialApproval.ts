
import { useState, useEffect, useCallback } from "react";
import { useClientesFinanceiros } from "@/hooks/useClientesFinanceiros";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchFinancialTitles, 
  fetchClientInfo, 
  fetchPedidosForRepresentantes, 
  processClientsData,
  fetchValoresVencidos
} from "@/services/financialService";

export const useFinancialApproval = () => {
  const { 
    clientesFinanceiros, 
    isLoading, 
    isLoadingSeparacoes, 
    hideCard, 
    updateVolumeSaudavel 
  } = useClientesFinanceiros();

  const { 
    addApprovedOrder, 
    loadApprovedOrders, 
    selectedYear, 
    selectedMonth, 
    calculateTotals, 
    isLoading: isLoadingApproved 
  } = useApprovedOrders();
  
  const [approvedSeparacaoIds, setApprovedSeparacaoIds] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);
  const [loadedApproved, setLoadedApproved] = useState(false);
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email || undefined
        });
      }
    };
    
    getCurrentUser();
  }, []);
  
  const loadApproved = useCallback(async () => {
    if (loadedApproved) return;
    
    try {
      const approvedOrders = await loadApprovedOrders(selectedYear, selectedMonth);
      console.log(`Loaded ${approvedOrders?.length || 0} approved orders for ${selectedYear}-${selectedMonth}`);
      
      // Create a set of approved separation IDs for efficient lookups
      const approvedIds = new Set(approvedOrders?.map(order => order.separacao_id) || []);
      setApprovedSeparacaoIds(approvedIds);
      setLoadedApproved(true);
    } catch (error) {
      console.error("Error loading approved orders:", error);
      setLoadedApproved(true);
    }
  }, [loadApprovedOrders, selectedYear, selectedMonth, loadedApproved]);

  useEffect(() => {
    loadApproved();
  }, [loadApproved]);

  useEffect(() => {
    setLoadedApproved(false);
  }, [selectedYear, selectedMonth]);

  // Log clientesFinanceiros to debug
  useEffect(() => {
    console.log("Current clientesFinanceiros:", clientesFinanceiros);
    console.log("Pending separations count before filtering:", 
      clientesFinanceiros.reduce((acc, client) => acc + client.separacoes.length, 0)
    );
  }, [clientesFinanceiros]);

  // Filter out clients with no pending separations or with all separations hidden
  const filteredClientesFinanceiros = clientesFinanceiros.filter(cliente => {
    // Only consider separations that are not approved and not manually hidden
    const pendingSeparacoes = cliente.separacoes.filter(
      separacao => 
        separacao.status === 'pendente' && 
        !approvedSeparacaoIds.has(separacao.id) && 
        !hiddenCardIds.has(separacao.id)
    );
    
    return pendingSeparacoes.length > 0;
  });

  // For each client, only include separations that are pending and not hidden
  const clientesWithPendingSeparacoes = filteredClientesFinanceiros.map(cliente => ({
    ...cliente,
    separacoes: cliente.separacoes.filter(
      separacao => 
        separacao.status === 'pendente' && 
        !approvedSeparacaoIds.has(separacao.id) && 
        !hiddenCardIds.has(separacao.id)
    )
  }));

  // Log filtered results
  useEffect(() => {
    console.log("Filtered clientesFinanceiros:", filteredClientesFinanceiros);
    console.log("Clients with pending separacoes:", clientesWithPendingSeparacoes);
    console.log("Approved separacao IDs:", [...approvedSeparacaoIds]);
    console.log("Hidden card IDs:", [...hiddenCardIds]);
  }, [filteredClientesFinanceiros, clientesWithPendingSeparacoes, approvedSeparacaoIds, hiddenCardIds]);

  const handleApprove = async (separacaoId: string, cliente: any) => {
    try {
      // Fetch complete separation details including items
      const { data: separacaoData, error: separacaoError } = await supabase
        .from('separacoes')
        .select(`
          *,
          separacao_itens(*)
        `)
        .eq('id', separacaoId)
        .single();
      
      if (separacaoError) {
        console.error("Error fetching separation details:", separacaoError);
        throw separacaoError;
      }
      
      // Update the client data with the complete separacao data including items
      const clienteWithSeparacaoData = {
        ...cliente,
        separacoes: cliente.separacoes.map((sep: any) => 
          sep.id === separacaoId 
            ? { ...sep, separacao_itens_flat: separacaoData.separacao_itens }
            : sep
        )
      };
      
      console.log("Adding approved order with complete data:", {
        separacaoId,
        clienteWithSeparacaoData,
        separacaoData
      });
      
      await addApprovedOrder(
        separacaoId, 
        clienteWithSeparacaoData, 
        currentUser?.email || null,
        currentUser?.id || null,
        'approved'
      );
      
      // Update separation status in database
      const { error: updateError } = await supabase
        .from('separacoes')
        .update({ status: 'aprovado' })
        .eq('id', separacaoId);
        
      if (updateError) {
        console.error("Error updating separation status:", updateError);
      }
      
      setApprovedSeparacaoIds(prev => {
        const newSet = new Set(prev);
        newSet.add(separacaoId);
        return newSet;
      });
    } catch (error) {
      console.error("Error in approval process:", error);
    }
  };
  
  const handleReject = async (separacaoId: string, cliente: any) => {
    try {
      // Fetch complete separation details including items
      const { data: separacaoData, error: separacaoError } = await supabase
        .from('separacoes')
        .select(`
          *,
          separacao_itens(*)
        `)
        .eq('id', separacaoId)
        .single();
      
      if (separacaoError) {
        console.error("Error fetching separation details:", separacaoError);
        throw separacaoError;
      }
      
      // Update the client data with the complete separacao data including items
      const clienteWithSeparacaoData = {
        ...cliente,
        separacoes: cliente.separacoes.map((sep: any) => 
          sep.id === separacaoId 
            ? { ...sep, separacao_itens_flat: separacaoData.separacao_itens }
            : sep
        )
      };
      
      console.log("Adding rejected order with complete data:", {
        separacaoId,
        clienteWithSeparacaoData
      });
      
      await addApprovedOrder(
        separacaoId, 
        clienteWithSeparacaoData, 
        currentUser?.email || null,
        currentUser?.id || null,
        'rejected'
      );
      
      // Update separation status in database
      const { error: updateError } = await supabase
        .from('separacoes')
        .update({ status: 'reprovado' })
        .eq('id', separacaoId);
        
      if (updateError) {
        console.error("Error updating separation status:", updateError);
      }
      
      setApprovedSeparacaoIds(prev => {
        const newSet = new Set(prev);
        newSet.add(separacaoId);
        return newSet;
      });
    } catch (error) {
      console.error("Error in rejection process:", error);
    }
  };

  const handleHideCard = (id: string) => {
    hideCard(id);
    
    // Also track locally hidden cards
    setHiddenCardIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  return {
    clientesWithPendingSeparacoes,
    isLoading: isLoading || isLoadingSeparacoes || isLoadingApproved,
    handleApprove,
    handleReject,
    handleHideCard,
    updateVolumeSaudavel
  };
};
