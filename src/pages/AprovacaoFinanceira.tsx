
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useClientesFinanceiros } from "@/hooks/useClientesFinanceiros";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";

const AprovacaoFinanceira = () => {
  const { 
    clientesFinanceiros, 
    isLoading, 
    isLoadingSeparacoes, 
    hideCard, 
    updateVolumeSaudavel 
  } = useClientesFinanceiros();

  if (isLoading || isLoadingSeparacoes) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Aprovação Financeira</h1>
        <p className="text-muted-foreground">
          Gerencie as aprovações financeiras dos pedidos e monitore informações financeiras dos clientes.
        </p>
        
        <h2 className="text-2xl font-bold mt-8">Pedidos Pendentes de Aprovação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientesFinanceiros.length > 0 ? (
            clientesFinanceiros.map((cliente) => (
              <ClienteFinanceiroCard
                key={cliente.PES_CODIGO}
                cliente={cliente}
                onUpdateVolumeSaudavel={updateVolumeSaudavel}
                onHideCard={hideCard}
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
