
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DashboardAlertsProps {
  hasData: boolean;
  isLoading: boolean;
  naoIdentificados: any[];
}

export const DashboardAlerts = ({ hasData, isLoading, naoIdentificados }: DashboardAlertsProps) => {
  if (!hasData && !isLoading) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Nenhum dado encontrado</AlertTitle>
        <AlertDescription>
          Não foram encontrados dados de faturamento para o período selecionado.
          Tente selecionar outro intervalo de datas.
        </AlertDescription>
      </Alert>
    );
  }

  // Mostra alerta se houver muitos itens não identificados
  if (naoIdentificados.length > 10 && hasData) {
    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Notas fiscais sem associação com pedidos</AlertTitle>
        <AlertDescription>
          Existem {naoIdentificados.length} notas fiscais que possuem número de pedido, 
          mas não foram associadas a nenhum pedido existente. 
          Estas notas aparecem como "Não identificado".
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
