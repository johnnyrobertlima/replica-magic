
import { useState } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FaturamentoTimeSeriesChart } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTimeSeriesChart";
import { FaturamentoKpiCards } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoKpiCards";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { FaturamentoTable } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTable";
import { CentroCustoIndicators } from "@/components/bluebay_adm/dashboard-comercial/CentroCustoIndicators";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";

const BluebayAdmDashboardComercial = () => {
  const {
    dashboardData,
    isLoading,
    startDate,
    endDate,
    setDateRange,
    refreshData
  } = useDashboardComercial();
  
  // Estado para controlar o filtro de Centro de Custo
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<string | null>(null);

  // Filtrar dados com base no Centro de Custo selecionado
  const filteredFaturamentoItems = selectedCentroCusto 
    ? dashboardData?.faturamentoItems.filter(item => {
        const pedidoCorrespondente = dashboardData.pedidoItems.find(p => 
          p.PED_NUMPEDIDO === item.PED_NUMPEDIDO && 
          p.PED_ANOBASE === item.PED_ANOBASE && 
          p.MPED_NUMORDEM === item.MPED_NUMORDEM
        );
        return pedidoCorrespondente?.CENTROCUSTO === selectedCentroCusto;
      }) 
    : dashboardData?.faturamentoItems || [];
  
  const filteredPedidoItems = selectedCentroCusto 
    ? dashboardData?.pedidoItems.filter(item => item.CENTROCUSTO === selectedCentroCusto)
    : dashboardData?.pedidoItems || [];

  // Recalcular totais com base nos itens filtrados
  const calculatedTotals = {
    totalFaturado: filteredFaturamentoItems.reduce((sum, item) => sum + (item.VALOR_NOTA || 0), 0),
    totalItens: filteredFaturamentoItems.reduce((sum, item) => sum + (item.QUANTIDADE || 0), 0),
    mediaValorItem: 0
  };
  
  calculatedTotals.mediaValorItem = calculatedTotals.totalItens > 0 
    ? calculatedTotals.totalFaturado / calculatedTotals.totalItens 
    : 0;

  // Verifica se há dados disponíveis
  const hasData = filteredFaturamentoItems.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <BluebayAdmBanner />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BluebayAdmMenu />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Dashboard Comercial</h1>
        
        <DashboardComercialFilters
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={setDateRange}
          onRefresh={refreshData}
          isLoading={isLoading}
        />
        
        {!hasData && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Nenhum dado encontrado</AlertTitle>
            <AlertDescription>
              Não foram encontrados dados de faturamento para o período selecionado.
              Tente selecionar outro intervalo de datas.
            </AlertDescription>
          </Alert>
        )}
        
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
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
