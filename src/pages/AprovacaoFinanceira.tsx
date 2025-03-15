
import { Toaster } from "@/components/ui/toaster";
import { AprovacaoFinanceiraHeader } from "@/components/jab-orders/AprovacaoFinanceiraHeader";
import { PendingApprovalsGrid } from "@/components/jab-orders/PendingApprovalsGrid";
import { FinanceiroLoading } from "@/components/jab-orders/FinanceiroLoading";
import { useFinancialApproval } from "@/hooks/useFinancialApproval";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";

const AprovacaoFinanceira = () => {
  const {
    clientesWithPendingSeparacoes,
    isLoading,
    handleApprove,
    handleReject,
    handleHideCard,
    updateVolumeSaudavel
  } = useFinancialApproval();

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayMenu />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6 mt-6">
          <h1 className="text-3xl font-bold tracking-tight">Aprovação Financeira</h1>
          <p className="text-muted-foreground max-w-3xl">
            Gerencie as aprovações financeiras dos pedidos e monitore informações financeiras dos clientes.
          </p>
        </div>
        
        {isLoading ? (
          <FinanceiroLoading />
        ) : (
          <PendingApprovalsGrid 
            clientes={clientesWithPendingSeparacoes}
            onUpdateVolumeSaudavel={updateVolumeSaudavel}
            onHideCard={handleHideCard}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        
        <Toaster />
      </div>
    </main>
  );
};

export default AprovacaoFinanceira;
