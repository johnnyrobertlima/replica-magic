import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AprovacaoFinanceira = () => {
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
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
            <p className="text-center text-muted-foreground">
              Nenhum pedido pendente de aprovação financeira.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AprovacaoFinanceira;
