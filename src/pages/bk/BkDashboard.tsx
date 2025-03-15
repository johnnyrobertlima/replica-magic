
import React, { useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { BkBanner } from "@/components/bk/BkBanner";
import { FinancialDashboard } from "@/components/bk/financial/FinancialDashboard";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { RefreshCw } from "lucide-react";
import { ItemTreemap } from "@/components/bk/dashboard/ItemTreemap";

export const BkDashboard = () => {
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

  // Fetch invoice items when loading invoices
  useEffect(() => {
    if (filteredInvoices.length > 0) {
      console.log("Invoices loaded, fetching items for treemap...");
    }
  }, [filteredInvoices]);

  // Process data for treemap - modified to use CLIENTE_NOME instead of items
  const treemapData = React.useMemo(() => {
    // If no invoices, return empty array
    if (filteredInvoices.length === 0) {
      return [];
    }

    // Group invoices by client and sum values
    const clientTotals = new Map<string, number>();

    filteredInvoices.forEach((invoice) => {
      if (invoice.CLIENTE_NOME) {
        const currentTotal = clientTotals.get(invoice.CLIENTE_NOME) || 0;
        clientTotals.set(
          invoice.CLIENTE_NOME,
          currentTotal + (invoice.VALOR_NOTA || 0)
        );
      }
    });

    const result = Array.from(clientTotals).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Log treemap data for debugging
    console.log("Treemap data by client:", result);
    
    return result;
  }, [filteredInvoices]);

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkBanner />
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
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

          <div className="grid gap-6">
            {treemapData.length > 0 ? (
              <ItemTreemap data={treemapData} />
            ) : (
              <div className="w-full h-[400px] bg-white rounded-lg p-4 border flex items-center justify-center">
                <p className="text-muted-foreground">Não há dados disponíveis para visualização</p>
              </div>
            )}
            <FinancialDashboard invoices={filteredInvoices} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkDashboard;
