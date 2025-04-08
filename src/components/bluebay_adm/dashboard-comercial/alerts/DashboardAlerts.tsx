
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DashboardAlertsProps {
  hasData: boolean;
  isLoading: boolean;
  naoIdentificados: any[];
}

export const DashboardAlerts = ({ hasData, isLoading, naoIdentificados }: DashboardAlertsProps) => {
  // Procurar nota 252770 entre os não identificados
  const nota252770NaoIdentificada = naoIdentificados.find(item => item.faturamento.NOTA === '252770');

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

  // Mostrar alerta específico se a nota 252770 estiver entre os não identificados
  if (nota252770NaoIdentificada && hasData) {
    return (
      <Alert variant="warning" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Nota 252770 sem associação com pedido</AlertTitle>
        <AlertDescription>
          A nota fiscal 252770 não foi associada a nenhum pedido existente.
          Valores dos campos: PED_NUMPEDIDO={nota252770NaoIdentificada.faturamento.PED_NUMPEDIDO}, 
          PED_ANOBASE={nota252770NaoIdentificada.faturamento.PED_ANOBASE},
          MPED_NUMORDEM={nota252770NaoIdentificada.faturamento.MPED_NUMORDEM}
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
