import React, { useState, useEffect } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FinancialHeader } from "@/components/bluebay_adm/financial/FinancialHeader";
import { FinancialFilters } from "@/components/bluebay_adm/financial/FinancialFilters";
import { FinancialSummaryCards } from "@/components/bluebay_adm/financial/FinancialSummaryCards";
import { TitleTable } from "@/components/bluebay_adm/financial/TitleTable";
import { InvoiceTable } from "@/components/bluebay_adm/financial/InvoiceTable";
import { ClientFinancialTable } from "@/components/bluebay_adm/financial/ClientFinancialTable";
import { ClientesVencidosTable } from "@/components/bluebay_adm/financial/ClientesVencidosTable";
import { FinancialTabs } from "@/components/bluebay_adm/financial/FinancialTabs";
import { ClientFilterBadge } from "@/components/bluebay_adm/financial/ClientFilterBadge";
import { LoadingState } from "@/components/bluebay_adm/financial/LoadingState";
import { useFinanciero } from "@/hooks/bluebay/useFinanciero";
import { useFinancialExport } from "@/hooks/bluebay/useFinancialExport";

const BluebayAdmFinanceiroManager = () => {
  const { 
    isLoading, 
    filteredInvoices,
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
  } = useFinanciero();

  const [activeTab, setActiveTab] = useState("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    console.log("filteredInvoices:", filteredInvoices);
    console.log("filteredTitles:", filteredTitles);
  }, [filteredInvoices, filteredTitles]);

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
    filteredTitles: clientFilteredTitles,
    filteredInvoices,
    clientFinancialSummaries
  });

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-8">
        <FinancialHeader 
          title="Financeiro Bluebay"
          onRefresh={refreshData}
          onExport={handleExportToExcel}
          isLoading={isLoading}
          activeTab={activeTab}
          hasData={{
            titles: clientFilteredTitles.length > 0,
            invoices: filteredInvoices.length > 0,
            clients: clientFinancialSummaries.length > 0,
            clientesVencidos: filteredTitles.length > 0
          }}
        />

        {isLoading && <LoadingState />}
        
        {!isLoading && (
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
                },
                {
                  id: "clientesVencidos",
                  label: "Clientes com Títulos Vencidos",
                  content: (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Clientes com Títulos Vencidos</h2>
                      <ClientesVencidosTable 
                        titles={filteredTitles} 
                        isLoading={isLoading} 
                        onClientSelect={handleClientSelect}
                      />
                    </>
                  )
                }
              ]}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default BluebayAdmFinanceiroManager;
