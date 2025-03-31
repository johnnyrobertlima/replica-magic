
import React, { useState, useEffect } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FinancialHeader } from "@/components/bluebay_adm/financial/FinancialHeader";
import { FinancialFilters } from "@/components/bluebay_adm/financial/FinancialFilters";
import { FinancialSummaryCards } from "@/components/bluebay_adm/financial/FinancialSummaryCards";
import { TitleTable } from "@/components/bluebay_adm/financial/TitleTable";
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
    financialSummary
  } = useFinanciero();

  const [activeTab, setActiveTab] = useState("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [filteredSummary, setFilteredSummary] = useState({
    totalValoresVencidos: 0,
    totalPago: 0,
    totalEmAberto: 0
  });

  useEffect(() => {
    console.log("filteredInvoices:", filteredInvoices);
    console.log("filteredTitles:", filteredTitles);
  }, [filteredInvoices, filteredTitles]);

  // Calculate summary based on filtered titles
  useEffect(() => {
    const today = new Date();
    let totalPago = 0;
    let totalEmAberto = 0;
    let totalValoresVencidos = 0;

    // Get the titles that should be considered (all filtered or just client filtered)
    const titlesToCalculate = selectedClient 
      ? filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient)
      : filteredTitles;
    
    // Process titles for summary calculation
    titlesToCalculate.forEach(title => {
      const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
      const vlrTitulo = title.VLRTITULO || 0;
      const vlrSaldo = title.VLRSALDO || 0;
      
      // Check if title is paid
      if (title.STATUS === '3') { // Status 3 = Pago
        totalPago += vlrTitulo;
      } else {
        // Add to total open amount if not paid
        totalEmAberto += vlrSaldo;
        
        // Check if overdue (vencimento date is in the past)
        if (vencimentoDate && vencimentoDate < today) {
          totalValoresVencidos += vlrSaldo;
        }
      }
    });

    setFilteredSummary({
      totalValoresVencidos,
      totalPago,
      totalEmAberto
    });
  }, [filteredTitles, selectedClient]);

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
    clientFinancialSummaries: []
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
            clients: [] !== null && [] !== undefined && [].length > 0,
            clientesVencidos: filteredTitles.length > 0
          }}
        />

        {isLoading && <LoadingState />}
        
        {!isLoading && (
          <div className="mt-6 space-y-6">
            <FinancialSummaryCards 
              totalValoresVencidos={filteredSummary.totalValoresVencidos}
              totalPago={filteredSummary.totalPago}
              totalEmAberto={filteredSummary.totalEmAberto}
              label={selectedClient ? "Cliente Selecionado" : "Filtro Atual"}
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
                  id: "clients",
                  label: "Clientes",
                  content: (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Clientes - Resumo Financeiro</h2>
                      <ClientFinancialTable 
                        clients={[]} 
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
