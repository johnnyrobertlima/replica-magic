
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { FaturamentoItem } from "@/services/bluebay/dashboardComercialTypes";

interface DashboardAlertsProps {
  hasData: boolean;
  isLoading: boolean;
  naoIdentificados: FaturamentoItem[];
}

export const DashboardAlerts = ({
  hasData,
  isLoading,
  naoIdentificados
}: DashboardAlertsProps) => {
  // Don't show alerts while loading
  if (isLoading) {
    return null;
  }

  const totalNaoIdentificados = naoIdentificados?.length || 0;
  const showNaoIdentificadosAlert = totalNaoIdentificados > 0;
  
  // Get a sample of the first non-identified item for the alert example (with null checks)
  const exemploItem = naoIdentificados && naoIdentificados.length > 0 ? 
    naoIdentificados.find(item => item && item.NOTA) : null;
  
  // Se não houver dados, exibir mensagem informativa
  if (!hasData) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum dado encontrado</AlertTitle>
        <AlertDescription>
          Não foram encontrados registros para o período selecionado.
          Tente alterar o intervalo de datas ou verifique se há dados disponíveis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {showNaoIdentificadosAlert && (
        <Alert className="mb-6" variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Itens sem Centro de Custo</AlertTitle>
          <AlertDescription>
            Foram encontrados {totalNaoIdentificados} itens sem Centro de Custo definido.
            {exemploItem && (
              <span className="block mt-1">
                Exemplo: Nota {exemploItem.NOTA || 'N/A'} 
                {exemploItem.ITEM_CODIGO ? ` - Item ${exemploItem.ITEM_CODIGO}` : ''}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
