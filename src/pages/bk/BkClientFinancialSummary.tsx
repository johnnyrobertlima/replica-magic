
import React from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { AdditionalFilters } from "@/components/bk/financial/AdditionalFilters";
import { ClientFinancialTable } from "@/components/bk/financial/ClientFinancialTable";
import { FinancialSummaryCards } from "@/components/bk/financial/FinancialSummaryCards";
import { RefreshCw } from "lucide-react";

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
    financialSummary,
    filterClientSummaries
  } = useFinancial();

  const filteredClientSummaries = filterClientSummaries();

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Resumo Financeiro por Cliente</h1>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
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
                notaFilter={""}
                onNotaFilterChange={() => {}}
              />
            </div>
            
            <DateRangePicker 
              startDate={dateRange.startDate} 
              endDate={dateRange.endDate} 
              onUpdate={updateDateRange}
              label="Período de Vencimento"
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
