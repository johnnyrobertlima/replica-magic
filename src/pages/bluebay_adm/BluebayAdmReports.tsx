
import React, { useMemo } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { ReportsTable } from "@/components/bluebay_adm/reports/ReportsTable";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { RefreshCw, Download } from "lucide-react";
import { useReports } from "@/hooks/bluebay/useReports";
import { exportToExcel } from "@/utils/excelUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

const BluebayAdmReports = () => {
  const { 
    isLoading, 
    items,
    refreshData, 
    dateRange, 
    updateDateRange,
    loadItemDetails,
    selectedItemDetails,
    isLoadingDetails
  } = useReports();

  // Calculate totals for summary cards
  const totals = useMemo(() => {
    if (!items.length) return { quantidade: 0, valor: 0 };
    
    return items.reduce((acc, item) => ({
      quantidade: acc.quantidade + item.TOTAL_QUANTIDADE,
      valor: acc.valor + item.TOTAL_VALOR,
    }), { quantidade: 0, valor: 0 });
  }, [items]);

  // Group items by GRU_DESCRICAO for export
  const groupedItems = useMemo(() => {
    const groups = {};
    
    items.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    
    return groups;
  }, [items]);

  const handleExportAllDetails = () => {
    // Prepare data for export
    const exportData = items.map(item => ({
      "Código": item.ITEM_CODIGO,
      "Descrição": item.DESCRICAO || '',
      "Grupo": item.GRU_DESCRICAO || 'Sem Grupo',
      "Quantidade Total": item.TOTAL_QUANTIDADE,
      "Valor Total": item.TOTAL_VALOR,
      "Ocorrências": item.OCORRENCIAS,
    }));
    
    exportToExcel(exportData, "relatorio-bluebay-itens");
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relatório de Itens</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExportAllDetails} disabled={isLoading || items.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Todos
            </Button>
          </div>
        </div>
  
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap justify-between gap-4 mb-4 items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Quantidade Total de Itens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals.quantidade.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totals.valor)}</div>
                </CardContent>
              </Card>
            </div>
            <DateRangePicker 
              startDate={dateRange.startDate} 
              endDate={dateRange.endDate} 
              onUpdate={updateDateRange} 
            />
          </div>
          
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Itens Bluebay</h2>
            <ReportsTable 
              items={items} 
              isLoading={isLoading}
              onItemClick={loadItemDetails}
              selectedItemDetails={selectedItemDetails}
              isLoadingDetails={isLoadingDetails}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default BluebayAdmReports;
