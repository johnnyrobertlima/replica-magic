
import React from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw } from "lucide-react";

export const BkFinanceiroManager = () => {
  const { 
    isLoading, 
    filteredInvoices,
    refreshData, 
    dateRange, 
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses
  } = useFinancial();

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento Financeiro</h1>
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
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Gerenciamento Financeiro</h2>
            <p className="text-muted-foreground mb-4">Esta página será utilizada para gerenciar operações financeiras específicas.</p>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Notas Pendentes</h3>
                  <p className="text-2xl font-bold">
                    {filteredInvoices.filter(inv => inv.STATUS === 'PENDENTE').length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Notas Aprovadas</h3>
                  <p className="text-2xl font-bold">
                    {filteredInvoices.filter(inv => inv.STATUS === 'APROVADO').length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkFinanceiroManager;
