
import React from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { InvoiceTable } from "@/components/bk/financial/InvoiceTable";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw, Loader2, FileSpreadsheet } from "lucide-react";
import { useFinancialExport } from "@/hooks/bk/financial/useFinancialExport";

export const BkFinancial = () => {
  const { 
    isLoading, 
    consolidatedInvoices, 
    filteredInvoices,
    refreshData, 
    dateRange, 
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses
  } = useFinancial();

  const { handleExportToExcel } = useFinancialExport({
    activeTab: 'invoices', // Export only invoices
    clientFilteredTitles: [], // No titles in this view
    filteredInvoices: filteredInvoices,
    clientFinancialSummaries: [] // No client summaries in this view
  });

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gestão de Faturamento</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportToExcel}
              disabled={isLoading || filteredInvoices.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>
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
          
          <FinancialDashboard invoices={filteredInvoices} />
          
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Notas Fiscais</h2>
            <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkFinancial;
