
import { Toaster } from "@/components/ui/toaster";
import { AprovacaoFinanceiraHeader } from "@/components/jab-orders/AprovacaoFinanceiraHeader";
import { PendingApprovalsGrid } from "@/components/jab-orders/PendingApprovalsGrid";
import { FinanceiroLoading } from "@/components/jab-orders/FinanceiroLoading";
import { useFinancialApproval } from "@/hooks/useFinancialApproval";

const AprovacaoFinanceira = () => {
  const {
    clientesWithPendingSeparacoes,
    isLoading,
    handleApprove,
    handleReject,
    handleHideCard,
    updateVolumeSaudavel
  } = useFinancialApproval();

  if (isLoading) {
    return <FinanceiroLoading />;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <AprovacaoFinanceiraHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PendingApprovalsGrid 
          clientes={clientesWithPendingSeparacoes}
          onUpdateVolumeSaudavel={updateVolumeSaudavel}
          onHideCard={handleHideCard}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
      
      <Toaster />
    </main>
  );
};

export default AprovacaoFinanceira;
