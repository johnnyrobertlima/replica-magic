
import { useState } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { DashboardContent } from "@/components/bluebay_adm/dashboard-comercial/DashboardContent";

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

  // Log adicional para diagnóstico
  if (dashboardData) {
    console.log(`Dashboard carregado: ${dashboardData.faturamentoItems.length} itens de faturamento, ${dashboardData.pedidoItems.length} itens de pedido`);
    
    // Verificar especificamente a nota 252770
    const nota252770 = dashboardData.faturamentoItems.find(item => item.NOTA === '252770');
    if (nota252770) {
      console.log('Nota 252770 encontrada no faturamento:', nota252770);
      
      // Procurar pedidos correspondentes usando os mesmos campos
      const pedidosCorrespondentes = dashboardData.pedidoItems.filter(p => 
        p.PED_NUMPEDIDO === nota252770.PED_NUMPEDIDO && 
        p.PED_ANOBASE === nota252770.PED_ANOBASE
      );
      
      if (pedidosCorrespondentes.length > 0) {
        console.log('Pedidos correspondentes encontrados:', pedidosCorrespondentes);
      } else {
        console.log('Nenhum pedido correspondente encontrado para a nota 252770');
        
        // Buscar todos os pedidos com o mesmo número para diagnóstico
        const pedidosComMesmoNumero = dashboardData.pedidoItems.filter(p => 
          p.PED_NUMPEDIDO === nota252770.PED_NUMPEDIDO
        );
        
        if (pedidosComMesmoNumero.length > 0) {
          console.log('Pedidos com o mesmo PED_NUMPEDIDO:', pedidosComMesmoNumero);
        }
      }
    } else {
      console.log('Nota 252770 não encontrada nos dados de faturamento');
    }
  }

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

        <DashboardContent
          dashboardData={dashboardData}
          selectedCentroCusto={selectedCentroCusto}
          setSelectedCentroCusto={setSelectedCentroCusto}
          isLoading={isLoading}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
