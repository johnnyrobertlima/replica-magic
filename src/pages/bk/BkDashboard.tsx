
import React, { useEffect, useState } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw, Loader2 } from "lucide-react";
import { ItemTreemap } from "@/components/bk/dashboard/ItemTreemap";
import { fetchBkItemsReport } from "@/services/bk/reportsService";
import { ClientsAbcCurve } from "@/components/bk/dashboard/abc-curve/ClientsAbcCurve";
import { ItemsAbcCurve } from "@/components/bk/dashboard/abc-curve/ItemsAbcCurve";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export const BkDashboard = () => {
  const { toast } = useToast();
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
  } = useFinancial();

  const [treemapData, setTreemapData] = useState<{ name: string; value: number }[]>([]);
  const [isLoadingTreemap, setIsLoadingTreemap] = useState(true);

  // Fetch invoice items when loading invoices
  useEffect(() => {
    const loadTreemapData = async () => {
      if (!isLoading && filteredInvoices.length > 0) {
        console.log("Invoices loaded, fetching items for treemap...");
        setIsLoadingTreemap(true);
        
        try {
          if (dateRange.startDate && dateRange.endDate) {
            const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
            const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
            
            const itemsReport = await fetchBkItemsReport(startDateFormatted, endDateFormatted);
            
            if (itemsReport && itemsReport.length > 0) {
              // Create dataset for the treemap
              const data = itemsReport.map(report => {
                const name = report.DESCRICAO 
                  ? `${report.ITEM_CODIGO} - ${report.DESCRICAO}` 
                  : report.ITEM_CODIGO;
                return { 
                  name, 
                  value: report.TOTAL_VALOR || 0 
                };
              });
              
              // Sort by value (highest to lowest)
              data.sort((a, b) => b.value - a.value);
              
              // Limit to 30 items for better visualization
              const limitedData = data.slice(0, 30);
              
              console.log(`Generated ${limitedData.length} items for treemap by ITEM_CODIGO`);
              setTreemapData(limitedData);
            } else {
              console.log("No items returned from report API");
              setTreemapData([]);
            }
          } else {
            console.log("No date range available for treemap");
            setTreemapData([]);
          }
        } catch (error) {
          console.error("Error processing treemap data:", error);
          toast({
            title: "Erro ao carregar dados do gráfico",
            description: "Não foi possível carregar os dados dos itens.",
            variant: "destructive"
          });
          setTreemapData([]);
        } finally {
          setIsLoadingTreemap(false);
        }
      } else if (!isLoading && filteredInvoices.length === 0) {
        console.log("No invoices available for treemap");
        setIsLoadingTreemap(false);
        setTreemapData([]);
      }
    };
    
    loadTreemapData();
  }, [filteredInvoices, dateRange.startDate, dateRange.endDate, isLoading, toast]);

  const handleRefresh = () => {
    setIsLoadingTreemap(true);
    refreshData();
  };

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading || isLoadingTreemap}>
            {(isLoading || isLoadingTreemap) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
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
            {/* 1. Indicadores financeiros no topo */}
            {isLoading ? (
              <div className="w-full h-32 bg-white rounded-lg p-4 border flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <FinancialDashboard invoices={filteredInvoices} />
            )}
            
            {/* 2. Curvas ABC de Clientes e Itens */}
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
            
            {/* 3. Gráfico de Volume por Item */}
            {isLoadingTreemap ? (
              <div className="w-full h-[400px] bg-white rounded-lg p-4 border flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : treemapData.length > 0 ? (
              <ItemTreemap data={treemapData} />
            ) : (
              <div className="w-full h-[400px] bg-white rounded-lg p-4 border flex items-center justify-center">
                <p className="text-muted-foreground">Não há dados disponíveis para visualização</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkDashboard;
