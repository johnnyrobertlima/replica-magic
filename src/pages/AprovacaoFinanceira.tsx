import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useClientesFinanceiros } from "@/hooks/useClientesFinanceiros";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const AprovacaoFinanceira = () => {
  const { 
    clientesFinanceiros, 
    isLoading, 
    isLoadingSeparacoes, 
    hideCard, 
    updateVolumeSaudavel 
  } = useClientesFinanceiros();

  const { addApprovedOrder, loadApprovedOrders, selectedYear, selectedMonth } = useApprovedOrders();
  const [approvedSeparacaoIds, setApprovedSeparacaoIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const loadApproved = async () => {
      const approvedOrders = loadApprovedOrders(selectedYear, selectedMonth);
      const approvedIds = new Set(approvedOrders.map(order => order.separacaoId));
      setApprovedSeparacaoIds(approvedIds);
    };
    
    loadApproved();
  }, [loadApprovedOrders, selectedYear, selectedMonth]);

  const filteredClientesFinanceiros = clientesFinanceiros.filter(cliente => {
    const pendingSeparacoes = cliente.separacoes.filter(
      separacao => !approvedSeparacaoIds.has(separacao.id)
    );
    
    return pendingSeparacoes.length > 0;
  });

  const clientesWithPendingSeparacoes = filteredClientesFinanceiros.map(cliente => ({
    ...cliente,
    separacoes: cliente.separacoes.filter(separacao => !approvedSeparacaoIds.has(separacao.id))
  }));

  if (isLoading || isLoadingSeparacoes) {
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
                onHideCard={hideCard}
                onApprove={(separacaoId) => {
                  addApprovedOrder(separacaoId, cliente);
                  setApprovedSeparacaoIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(separacaoId);
                    return newSet;
                  });
                }}
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
