
import { Link } from "react-router-dom";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { CardColorLegend } from "@/components/jab-orders/CardColorLegend";

export const AprovacaoFinanceiraHeader = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-6">
        <JabNavMenu />
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Aprovação Financeira</h1>
        <p className="text-muted-foreground max-w-3xl">
          Gerencie as aprovações financeiras dos pedidos e monitore informações financeiras dos clientes.
        </p>
        
        <CardColorLegend />
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pedidos Pendentes de Aprovação</h2>
          <Link 
            to="/client-area/bluebay/acompanhamento-faturamento" 
            className="text-primary hover:underline flex items-center gap-1.5 transition-colors hover:text-primary/80"
          >
            Ver Pedidos Aprovados
          </Link>
        </div>
      </div>
    </>
  );
};
