
import React from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { ReportsTable } from "@/components/bk/reports/ReportsTable";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { RefreshCw } from "lucide-react";
import { useReports } from "@/hooks/bk/useReports";

export const BkReports = () => {
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

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relatório de Itens</h1>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
  
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap justify-between gap-4 mb-4 items-center">
            <div></div> {/* Spacer to align with financial page */}
            <DateRangePicker 
              startDate={dateRange.startDate} 
              endDate={dateRange.endDate} 
              onUpdate={updateDateRange} 
            />
          </div>
          
          <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Itens Faturados</h2>
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
    </div>
  );
};

export default BkReports;
