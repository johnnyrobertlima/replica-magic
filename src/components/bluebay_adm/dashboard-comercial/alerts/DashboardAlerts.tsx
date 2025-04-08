
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface DashboardAlertsProps {
  hasData: boolean;
  isLoading: boolean;
  naoIdentificados: any[];
  ambiguityDetected?: boolean;
}

export const DashboardAlerts = ({ hasData, isLoading, naoIdentificados, ambiguityDetected = false }: DashboardAlertsProps) => {
  // Procurar nota 252566 entre os não identificados ou com ambiguidade
  const nota252566NaoIdentificada = naoIdentificados.find(item => item.faturamento.NOTA === '252566');

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

  // Mostrar alerta específico se houver ambiguidade na nota 252566
  if (ambiguityDetected && hasData) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ambiguidade detectada na nota 252566</AlertTitle>
        <AlertDescription>
          Foram encontrados múltiplos pedidos correspondentes à nota 252566.
          O sistema utilizou regras de prioridade para selecionar o pedido mais relevante.
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar alerta específico se a nota 252566 estiver entre os não identificados
  if (nota252566NaoIdentificada && hasData) {
    return (
      <Alert variant="warning" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Nota 252566 sem associação com pedido</AlertTitle>
        <AlertDescription>
          A nota fiscal 252566 não foi associada a nenhum pedido existente.
          Valores dos campos: PED_NUMPEDIDO={nota252566NaoIdentificada.faturamento.PED_NUMPEDIDO}, 
          PED_ANOBASE={nota252566NaoIdentificada.faturamento.PED_ANOBASE},
          MPED_NUMORDEM={nota252566NaoIdentificada.faturamento.MPED_NUMORDEM}
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
