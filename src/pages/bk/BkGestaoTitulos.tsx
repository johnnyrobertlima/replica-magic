
import React from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { TitleTable } from "@/components/bk/financial/TitleTable";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw } from "lucide-react";

export const BkGestaoTitulos = () => {
  const { 
    isLoading, 
    filteredTitles,
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
          <h1 className="text-3xl font-bold">Gestão de Títulos</h1>
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
          
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Títulos</h2>
            <TitleTable titles={filteredTitles} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkGestaoTitulos;
