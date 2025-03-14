
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useClientesFinanceiros } from "@/hooks/useClientesFinanceiros";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const AprovacaoFinanceira = () => {
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
      console.log(`Loaded ${approvedOrders.length} approved orders for ${selectedYear}-${selectedMonth}`);
      
      // Create a set of approved separation IDs for efficient lookups
      const approvedIds = new Set(approvedOrders.map(order => order.separacaoId));
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

  const handleApprove = (separacaoId: string, cliente: any) => {
    addApprovedOrder(
      separacaoId, 
      cliente, 
      currentUser?.email || null,
      currentUser?.id || null,
      'approved'
    );
    
    setApprovedSeparacaoIds(prev => {
      const newSet = new Set(prev);
      newSet.add(separacaoId);
      return newSet;
    });
  };
  
  const handleReject = (separacaoId: string, cliente: any) => {
    addApprovedOrder(
      separacaoId, 
      cliente, 
      currentUser?.email || null,
      currentUser?.id || null,
      'rejected'
    );
    
    setApprovedSeparacaoIds(prev => {
      const newSet = new Set(prev);
      newSet.add(separacaoId);
      return newSet;
    });
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

  if (isLoading || isLoadingSeparacoes || isLoadingApproved) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-6">
        <JabNavMenu />
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Aprovação Financeira</h1>
        <p className="text-muted-foreground">
          Gerencie as aprovações financeiras dos pedidos e monitore informações financeiras dos clientes.
        </p>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pedidos Pendentes de Aprovação</h2>
          <Link 
            to="/client-area/bluebay/acompanhamento-faturamento" 
            className="text-primary hover:underline"
          >
            Ver Pedidos Aprovados
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientesWithPendingSeparacoes.length > 0 ? (
            clientesWithPendingSeparacoes.map((cliente) => (
              <ClienteFinanceiroCard
                key={cliente.PES_CODIGO}
                cliente={cliente}
                onUpdateVolumeSaudavel={updateVolumeSaudavel}
                onHideCard={handleHideCard}
                onApprove={(separacaoId) => handleApprove(separacaoId, cliente)}
                onReject={(separacaoId) => handleReject(separacaoId, cliente)}
              />
            ))
          ) : (
            <Card className="col-span-2">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Nenhum pedido pendente de aprovação financeira.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </main>
  );
};

export default AprovacaoFinanceira;
