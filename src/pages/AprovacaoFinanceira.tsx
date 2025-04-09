
import { Toaster } from "@/components/ui/toaster";
import { PendingApprovalsGrid } from "@/components/jab-orders/PendingApprovalsGrid";
import { FinanceiroLoading } from "@/components/jab-orders/FinanceiroLoading";
import { useFinancialApproval } from "@/hooks/useFinancialApproval";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";
import { AprovacaoFinanceiraHeader } from "@/components/jab-orders/AprovacaoFinanceiraHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

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
        <div className="flex items-center justify-between mb-6">
          <AprovacaoFinanceiraHeader />
          <Link to="/client-area/bluebay/rejected-separations">
            <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
              <X className="h-4 w-4 text-red-500 mr-2" />
              <span>Ver Separações Reprovadas</span>
              <Badge variant="destructive" className="ml-2 bg-red-500">Reprovados</Badge>
            </Button>
          </Link>
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
