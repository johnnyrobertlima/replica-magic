
import { FaturamentoKpiCards } from "./FaturamentoKpiCards";
import { FaturamentoTimeSeriesChart } from "./FaturamentoTimeSeriesChart";
import { CentroCustoIndicators } from "./CentroCustoIndicators";
import { FaturamentoTable } from "./FaturamentoTable";
import { DashboardAlerts } from "./alerts/DashboardAlerts";
import { useDataFiltering } from "./filters/useDataFiltering";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";

interface DashboardContentProps {
  dashboardData: {
    faturamentoItems: FaturamentoItem[];
    pedidoItems: PedidoItem[];
    dailyFaturamento: any[];
    monthlyFaturamento: any[];
  } | null;
  selectedCentroCusto: string | null;
  setSelectedCentroCusto: (centroCusto: string | null) => void;
  isLoading: boolean;
  startDate: Date;
  endDate: Date;
}

export const DashboardContent = ({
  dashboardData,
  selectedCentroCusto,
  setSelectedCentroCusto,
  isLoading,
  startDate,
  endDate
}: DashboardContentProps) => {
  // Obter dados filtrados e calculados
  const {
    filteredFaturamentoItems,
    filteredPedidoItems,
    calculatedTotals,
    naoIdentificados,
    hasFilteredData,
    ambiguityDetected
  } = useDataFiltering(dashboardData, selectedCentroCusto, isLoading);

  // Verifica se há dados disponíveis
  const hasData = !isLoading && dashboardData && dashboardData.faturamentoItems.length > 0;

  return (
    <>
      <DashboardAlerts 
        hasData={hasData} 
        isLoading={isLoading} 
        naoIdentificados={naoIdentificados}
        ambiguityDetected={ambiguityDetected}
      />

      <div className="mb-6">
        <FaturamentoKpiCards
          totalFaturado={calculatedTotals.totalFaturado}
          totalItens={calculatedTotals.totalItens}
          mediaValorItem={calculatedTotals.mediaValorItem}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <FaturamentoTimeSeriesChart
          dailyData={dashboardData?.dailyFaturamento || []}
          monthlyData={dashboardData?.monthlyFaturamento || []}
          startDate={startDate}
          endDate={endDate}
          isLoading={isLoading}
        />
      </div>
      
      {/* Indicadores por Centro de Custo com funcionalidade de filtro */}
      <CentroCustoIndicators 
        faturamentoItems={dashboardData?.faturamentoItems || []}
        pedidoItems={dashboardData?.pedidoItems || []}
        isLoading={isLoading}
        selectedCentroCusto={selectedCentroCusto}
        onCentroCustoSelect={setSelectedCentroCusto}
      />
      
      {/* Tabela de Notas Fiscais e Pedidos (filtrada pelo Centro de Custo selecionado) */}
      <FaturamentoTable 
        faturamentoData={filteredFaturamentoItems}
        pedidoData={filteredPedidoItems}
        isLoading={isLoading}
      />
    </>
  );
};
