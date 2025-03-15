
import { Toaster } from "@/components/ui/toaster";
import { PendingApprovalsGrid } from "@/components/jab-orders/PendingApprovalsGrid";
import { FinanceiroLoading } from "@/components/jab-orders/FinanceiroLoading";
import { useFinancialApproval } from "@/hooks/useFinancialApproval";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";
import { AprovacaoFinanceiraHeader } from "@/components/jab-orders/AprovacaoFinanceiraHeader";

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
        <AprovacaoFinanceiraHeader />
        
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
