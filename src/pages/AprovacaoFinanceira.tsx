
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";

const AprovacaoFinanceira = () => {
  const { data: separacoes = [], isLoading } = useSeparacoes();

  // Filtra apenas as separações pendentes
  const separacoesPendentes = separacoes.filter(sep => sep.status === 'pendente');

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Aprovação Financeira</h1>
        <p className="text-muted-foreground">
          Gerencie as aprovações financeiras dos pedidos.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {separacoesPendentes.length > 0 ? (
              separacoesPendentes.map((separacao) => (
                <SeparacaoCard key={separacao.id} separacao={separacao} />
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum pedido pendente de aprovação financeira.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default AprovacaoFinanceira;
