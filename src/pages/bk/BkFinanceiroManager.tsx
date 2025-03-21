
import React, { useState } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { TitleTable } from "@/components/bk/financial/TitleTable";
import { InvoiceTable } from "@/components/bk/financial/InvoiceTable";
import { useFinancial } from "@/hooks/bk/useFinancial";
import { FinancialHeader } from "@/components/bk/financial/FinancialHeader";
import { FinancialFilters } from "@/components/bk/financial/FinancialFilters";
import { FinancialSummaryCards } from "@/components/bk/financial/FinancialSummaryCards";
import { FinancialTabs } from "@/components/bk/financial/FinancialTabs";
import { useFinancialExport } from "@/hooks/bk/financial/useFinancialExport";
import { ClientFilterBadge } from "@/components/bk/financial/ClientFilterBadge";
import { ClientFinancialTable } from "@/components/bk/financial/ClientFinancialTable";

export const BkFinanceiroManager = () => {
  const { 
    isLoading, 
    consolidatedInvoices, 
    filteredInvoices,
    financialTitles,
    filteredTitles,
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
    clientFinancialSummaries
  } = useFinancial();

  const [activeTab, setActiveTab] = useState("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const clientFilteredTitles = selectedClient 
    ? filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient)
    : filteredTitles;

  const handleClientSelect = (clientCode: string) => {
    setSelectedClient(clientCode);
    setActiveTab("titles");
  };

  const handleResetClientSelection = () => {
    setSelectedClient(null);
  };

  const { handleExportToExcel } = useFinancialExport({
    activeTab,
    clientFilteredTitles,
    filteredInvoices,
    clientFinancialSummaries
  });

  return (
    <div className="container-fluid p-0 max-w-full">
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <FinancialHeader 
          title="Gerenciamento Financeiro"
          onRefresh={refreshData}
          onExport={handleExportToExcel}
          isLoading={isLoading}
          activeTab={activeTab}
          hasData={{
            titles: clientFilteredTitles.length > 0,
            invoices: filteredInvoices.length > 0,
            clients: clientFinancialSummaries.length > 0
          }}
        />
  
        <div className="mt-6 space-y-6">
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
          
          {selectedClient && (
            <ClientFilterBadge 
              onReset={handleResetClientSelection} 
            />
          )}
          
          <FinancialTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              {
                id: "titles",
                label: "Títulos Financeiros",
                content: (
                  <>
                    <h2 className="text-xl font-semibold mb-4">
                      {selectedClient 
                        ? `Títulos Financeiros do Cliente` 
                        : `Títulos Financeiros`}
                    </h2>
                    <TitleTable titles={clientFilteredTitles} isLoading={isLoading} />
                  </>
                )
              },
              {
                id: "invoices",
                label: "Notas Fiscais",
                content: (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Notas Fiscais</h2>
                    <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} />
                  </>
                )
              },
              {
                id: "clients",
                label: "Clientes",
                content: (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Clientes - Resumo Financeiro</h2>
                    <ClientFinancialTable 
                      clients={clientFinancialSummaries} 
                      isLoading={isLoading} 
                      onClientSelect={handleClientSelect}
                    />
                  </>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default BkFinanceiroManager;
