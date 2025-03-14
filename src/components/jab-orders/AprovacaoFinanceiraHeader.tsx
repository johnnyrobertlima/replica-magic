
import { Link } from "react-router-dom";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";

export const AprovacaoFinanceiraHeader = () => {
  return (
    <>
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
      </div>
    </>
  );
};
