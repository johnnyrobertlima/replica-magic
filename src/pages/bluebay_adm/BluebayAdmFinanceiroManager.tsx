
import React, { useState, useEffect } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FinancialHeader } from "@/components/bluebay_adm/financial/FinancialHeader";
import { FinancialLoader } from "@/components/bluebay_adm/financial/FinancialLoader";
import { FinancialContent } from "@/components/bluebay_adm/financial/FinancialContent";
import { useFinanciero } from "@/hooks/bluebay/useFinanciero";
import { useFinancialExport } from "@/hooks/bluebay/useFinancialExport";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

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
    clientFinancialSummaries,
    pagination
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

  // Calculate summary based on filtered titles, excluding canceled titles (status '4')
  useEffect(() => {
    const today = new Date();
    let totalPago = 0;
    let totalEmAberto = 0;
    let totalValoresVencidos = 0;

    // Get the titles that should be considered (all filtered or just client filtered)
    const titlesToCalculate = selectedClient 
      ? filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient)
      : filteredTitles;
    
    // Process titles for summary calculation, excluding canceled titles (status '4')
    titlesToCalculate
      .filter(title => title.STATUS !== '4') // Exclude canceled titles
      .forEach(title => {
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
    clientFinancialSummaries: clientFinancialSummaries || []
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
            clients: clientFinancialSummaries !== null && clientFinancialSummaries !== undefined && clientFinancialSummaries.length > 0,
            clientesVencidos: filteredTitles.length > 0
          }}
        />

        <FinancialLoader isLoading={isLoading}>
          <FinancialContent
            isLoading={isLoading}
            filteredSummary={filteredSummary}
            selectedClient={selectedClient}
            statusFilter={statusFilter}
            updateStatusFilter={updateStatusFilter}
            availableStatuses={availableStatuses}
            clientFilter={clientFilter}
            updateClientFilter={updateClientFilter}
            notaFilter={notaFilter}
            updateNotaFilter={updateNotaFilter}
            dateRange={dateRange}
            updateDateRange={updateDateRange}
            handleResetClientSelection={handleResetClientSelection}
            handleClientSelect={handleClientSelect}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            clientFilteredTitles={clientFilteredTitles}
            filteredTitles={filteredTitles}
            clientFinancialSummaries={clientFinancialSummaries}
          />
          
          {/* Pagination controls */}
          {pagination && (
            <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-md shadow">
              <div className="text-sm text-muted-foreground">
                Mostrando {clientFilteredTitles.length} registros de um total de {pagination.totalCount} 
                (Página {pagination.currentPage})
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={pagination.goToPreviousPage}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={pagination.goToNextPage}
                  disabled={!pagination.hasNextPage}
                >
                  Próxima <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </FinancialLoader>
      </div>
    </main>
  );
};

export default BluebayAdmFinanceiroManager;
