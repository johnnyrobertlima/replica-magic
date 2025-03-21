
import React, { useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { ClientFinancialTable } from "@/components/bk/financial/ClientFinancialTable";
import { TitleTable } from "@/components/bk/financial/TitleTable";
import { FinancialSummaryCards } from "@/components/bk/financial/FinancialSummaryCards";
import { FinancialHeader } from "@/components/bk/financial/FinancialHeader";
import { FinancialFilters } from "@/components/bk/financial/FinancialFilters";
import { useFinancialExport } from "@/hooks/bk/financial/useFinancialExport";

export const BkClientFinancialSummary = () => {
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

  const { handleExportToExcel } = useFinancialExport({
    activeTab: 'all', // No tabs in this view, export all data
    clientFilteredTitles: filteredTitles,
    filteredInvoices: [],
    clientFinancialSummaries: filteredClientSummaries
  });

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <FinancialHeader 
          title="Resumo Financeiro por Cliente"
          onRefresh={refreshData}
          onExport={handleExportToExcel}
          isLoading={isLoading}
          activeTab="all"
          hasData={{
            titles: filteredTitles.length > 0,
            invoices: false,
            clients: filteredClientSummaries.length > 0
          }}
        />
  
        <div className="mt-6 space-y-6">
          {/* Indicadores Financeiros */}
          <FinancialSummaryCards 
            totalValoresVencidos={financialSummary.totalValoresVencidos}
            totalPago={financialSummary.totalPago}
            totalEmAberto={financialSummary.totalEmAberto}
          />
          
          <FinancialFilters
            statusFilter={statusFilter}
            onStatusChange={updateStatusFilter}
            statuses={availableStatuses}
            clientFilter={clientFilter}
            onClientFilterChange={updateClientFilter}
            notaFilter={notaFilter}
            onNotaFilterChange={updateNotaFilter}
            dateRange={dateRange}
            onDateRangeUpdate={updateDateRange}
          />
          
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
