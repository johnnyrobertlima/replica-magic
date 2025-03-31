
import React, { useState } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FinancialHeader } from "@/components/bluebay_adm/financial/FinancialHeader";
import { FinancialLoader } from "@/components/bluebay_adm/financial/FinancialLoader";
import { FinancialContent } from "@/components/bluebay_adm/financial/FinancialContent";
import { PaginationControls } from "@/components/bluebay_adm/financial/PaginationControls";
import { FinancialSummaryCalculator } from "@/components/bluebay_adm/financial/FinancialSummaryCalculator";
import { useFinanciero } from "@/hooks/bluebay/useFinanciero";
import { useFinancialExport } from "@/hooks/bluebay/useFinancialExport";
import { useCollectionStatus } from "@/hooks/bluebay/useCollectionStatus";

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

  const {
    collectedClients,
    collectionRecords,
    showCollectedOnly,
    handleCollectionStatusChange,
    toggleShowCollected,
    resetClientCollectionStatus,
    resetAllCollectionStatus
  } = useCollectionStatus({ userName: "Financeiro" });

  const [activeTab, setActiveTab] = useState("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [filteredSummary, setFilteredSummary] = useState({
    totalValoresVencidos: 0,
    totalPago: 0,
    totalEmAberto: 0
  });

  // Títulos filtrados por cliente selecionado
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
            clientesVencidos: filteredTitles.length > 0,
            cobranca: filteredTitles.length > 0,
            origem: clientFilteredTitles.length > 0,
            cobrados: collectionRecords.length > 0
          }}
        />

        <FinancialSummaryCalculator 
          filteredTitles={filteredTitles}
          selectedClient={selectedClient}
          onSummaryCalculated={setFilteredSummary}
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
            collectedClients={collectedClients}
            collectionRecords={collectionRecords}
            showCollectedOnly={showCollectedOnly}
            onToggleCollectedView={toggleShowCollected}
            onCollectionStatusChange={handleCollectionStatusChange}
            onResetCollectionStatus={resetClientCollectionStatus}
            onResetAllCollectionStatus={resetAllCollectionStatus}
          />
          
          <PaginationControls
            pagination={pagination}
            itemCount={clientFilteredTitles.length}
          />
        </FinancialLoader>
      </div>
    </main>
  );
};

export default BluebayAdmFinanceiroManager;
