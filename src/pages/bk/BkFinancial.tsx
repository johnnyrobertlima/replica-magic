
import React from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { InvoiceTable } from "@/components/bk/financial/InvoiceTable";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { RefreshCw } from "lucide-react";

export const BkFinancial = () => {
  const { 
    isLoading, 
    consolidatedInvoices, 
    refreshData, 
    dateRange, 
    updateDateRange 
  } = useFinancial();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestão de Faturamento</h1>
        <Button variant="outline" onClick={refreshData} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <BkMenu />

      <div className="mt-6 space-y-6">
        <div className="flex justify-end mb-4">
          <DateRangePicker 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate} 
            onUpdate={updateDateRange} 
          />
        </div>
        
        <FinancialDashboard invoices={consolidatedInvoices} />
        
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Notas Fiscais</h2>
          <InvoiceTable invoices={consolidatedInvoices} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default BkFinancial;
