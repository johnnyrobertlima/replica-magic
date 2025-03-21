
import React, { useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { AdditionalFilters } from "@/components/bk/financial/AdditionalFilters";
import { ClientFinancialTable } from "@/components/bk/financial/ClientFinancialTable";
import { TitleTable } from "@/components/bk/financial/TitleTable";
import { FinancialSummaryCards } from "@/components/bk/financial/FinancialSummaryCards";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { exportToExcel } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

export const BkClientFinancialSummary = () => {
  const { toast } = useToast();
  
  const { 
    isLoading, 
    refreshData, 
    dateRange, 
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    financialSummary,
    filteredTitles,
    filterClientSummaries
  } = useFinancial();

  const filteredClientSummaries = filterClientSummaries();

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Function to handle Excel export
  const handleExportToExcel = () => {
    try {
      // Prepare client summaries data for export
      const clientSummaryData = filteredClientSummaries.map(client => ({
        'Código': client.PES_CODIGO,
        'Cliente': client.CLIENTE_NOME,
        'Valores Vencidos': client.totalValoresVencidos,
        'Valores Pagos': client.totalPago,
        'Valores em Aberto': client.totalEmAberto
      }));

      // Prepare titles data for export
      const titlesData = filteredTitles.map(title => ({
        'Nota': title.NUMNOTA || '',
        'Cliente': title.CLIENTE_NOME || '',
        'Data Emissão': title.DTEMISSAO || '',
        'Data Vencimento': title.DTVENCIMENTO || '',
        'Data Pagamento': title.DTPAGTO || '',
        'Valor Título': title.VLRTITULO || 0,
        'Valor Desconto': title.VLRDESCONTO || 0,
        'Valor Saldo': title.VLRSALDO || 0,
        'Status': title.STATUS || ''
      }));

      // Export the data to Excel - Using exportToExcelWithSections is better here since we have two related datasets
      if (clientSummaryData.length > 0 || titlesData.length > 0) {
        exportToExcel(
          [...clientSummaryData, ...titlesData], 
          `relatorio-financeiro-${new Date().toISOString().split('T')[0]}`
        );
        
        toast({
          title: "Exportação Concluída",
          description: `${clientSummaryData.length} clientes e ${titlesData.length} títulos exportados com sucesso.`,
        });
      } else {
        toast({
          title: "Nenhum dado para exportar",
          description: "Aplique filtros diferentes ou atualize os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Resumo Financeiro por Cliente</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportToExcel} 
              disabled={isLoading || (filteredClientSummaries.length === 0 && filteredTitles.length === 0)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
  
        <div className="mt-6 space-y-6">
          {/* Indicadores Financeiros */}
          <FinancialSummaryCards 
            totalValoresVencidos={financialSummary.totalValoresVencidos}
            totalPago={financialSummary.totalPago}
            totalEmAberto={financialSummary.totalEmAberto}
          />
          
          <div className="flex flex-wrap justify-between gap-4 mb-4 items-start">
            <div className="space-y-4 w-full md:w-auto">
              <StatusFilter 
                selectedStatus={statusFilter} 
                onStatusChange={updateStatusFilter}
                statuses={availableStatuses}
              />
              <AdditionalFilters 
                clientFilter={clientFilter}
                onClientFilterChange={updateClientFilter}
                notaFilter={notaFilter}
                onNotaFilterChange={updateNotaFilter}
              />
            </div>
            
            <DateRangePicker 
              startDate={dateRange.startDate} 
              endDate={dateRange.endDate} 
              onUpdate={updateDateRange}
              label="Período de Vencimento"
            />
          </div>
          
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Títulos Financeiros</h2>
            <TitleTable 
              titles={filteredTitles} 
              isLoading={isLoading} 
            />
          </div>
          
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Resumo Financeiro por Cliente</h2>
            <ClientFinancialTable 
              clients={filteredClientSummaries} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkClientFinancialSummary;
