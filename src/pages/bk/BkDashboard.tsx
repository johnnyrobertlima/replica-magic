
import React, { useEffect, useState } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { BkBanner } from "@/components/bk/BkBanner";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw } from "lucide-react";
import { ItemTreemap } from "@/components/bk/dashboard/ItemTreemap";
import { fetchBkItemsReport } from "@/services/bk/reportsService";
import { ClientsAbcCurve } from "@/components/bk/dashboard/abc-curve/ClientsAbcCurve";
import { ItemsAbcCurve } from "@/components/bk/dashboard/abc-curve/ItemsAbcCurve";

export const BkDashboard = () => {
  const {
    isLoading,
    consolidatedInvoices,
    filteredInvoices,
    refreshData,
    dateRange,
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses,
    faturamentoData,
  } = useFinancial();

  const [treemapData, setTreemapData] = useState<{ name: string; value: number }[]>([]);
  const [isLoadingTreemap, setIsLoadingTreemap] = useState(true);

  // Fetch invoice items when loading invoices
  useEffect(() => {
    const loadTreemapData = async () => {
      if (filteredInvoices.length > 0) {
        console.log("Invoices loaded, fetching items for treemap...");
        setIsLoadingTreemap(true);
        
        try {
          // Utilizando todos os registros de faturamento em vez de apenas os consolidados
          // para garantir que temos todos os itens
          if (faturamentoData.length > 0) {
            // Agrupar por ITEM_CODIGO em vez de CLIENTE_NOME
            const itemTotals = new Map<string, number>();
            const itemDescriptions = new Map<string, string>();
            
            faturamentoData.forEach((item) => {
              if (item.ITEM_CODIGO) {
                const currentTotal = itemTotals.get(item.ITEM_CODIGO) || 0;
                const valorUnitario = item.VALOR_UNITARIO || 0;
                const quantidade = item.QUANTIDADE || 0;
                const valorItem = valorUnitario * quantidade;
                
                itemTotals.set(item.ITEM_CODIGO, currentTotal + valorItem);
                
                // Note: DESCRICAO não está disponível diretamente nos itens de faturamento
                // vamos buscar do reportsService depois
              }
            });
            
            // Se não temos descrições nos itens de faturamento, vamos buscar do reportsService
            if (itemTotals.size > 0) {
              const itemsReport = await fetchBkItemsReport(dateRange.startDate, dateRange.endDate);
              itemsReport.forEach(report => {
                if (report.DESCRICAO) {
                  itemDescriptions.set(report.ITEM_CODIGO, report.DESCRICAO);
                }
              });
            }
            
            // Criar dataset para o treemap
            const data = Array.from(itemTotals).map(([code, value]) => {
              const description = itemDescriptions.get(code);
              const name = description ? `${code} - ${description}` : code;
              return { name, value };
            });
            
            // Ordenar por valor (maior para menor)
            data.sort((a, b) => b.value - a.value);
            
            // Limitar a 30 itens para melhor visualização
            const limitedData = data.slice(0, 30);
            
            console.log(`Generated ${limitedData.length} items for treemap by ITEM_CODIGO`);
            setTreemapData(limitedData);
          } else {
            console.log("No faturamento data available for treemap");
            setTreemapData([]);
          }
        } catch (error) {
          console.error("Error processing treemap data:", error);
          setTreemapData([]);
        } finally {
          setIsLoadingTreemap(false);
        }
      }
    };
    
    loadTreemapData();
  }, [filteredInvoices, faturamentoData, dateRange.startDate, dateRange.endDate]);

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkBanner />
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap justify-between gap-4 mb-4 items-center">
            <StatusFilter
              selectedStatus={statusFilter}
              onStatusChange={updateStatusFilter}
              statuses={availableStatuses}
            />
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onUpdate={updateDateRange}
            />
          </div>

          <div className="grid gap-6">
            {isLoadingTreemap ? (
              <div className="w-full h-[400px] bg-white rounded-lg p-4 border flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : treemapData.length > 0 ? (
              <ItemTreemap data={treemapData} />
            ) : (
              <div className="w-full h-[400px] bg-white rounded-lg p-4 border flex items-center justify-center">
                <p className="text-muted-foreground">Não há dados disponíveis para visualização</p>
              </div>
            )}

            {/* ABC Curves Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClientsAbcCurve 
                invoices={filteredInvoices} 
                isLoading={isLoading} 
              />
              <ItemsAbcCurve 
                data={treemapData} 
                isLoading={isLoadingTreemap} 
              />
            </div>
            
            <FinancialDashboard invoices={filteredInvoices} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkDashboard;
