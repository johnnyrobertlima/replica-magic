
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

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
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
    </main>
  );
};

export default AprovacaoFinanceira;
