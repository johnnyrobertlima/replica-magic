
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
import { useFinancialTabSelection } from "@/hooks/bluebay/useFinancialTabSelection";
import { useClientFilteredTitles } from "@/hooks/bluebay/useClientFilteredTitles";

const BluebayAdmFinanceiroManager = () => {
  // Use our custom hooks to separate concerns
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

  const {
    activeTab,
    setActiveTab,
    selectedClient,
    handleClientSelect,
    handleResetClientSelection
  } = useFinancialTabSelection();

  const [filteredSummary, setFilteredSummary] = useState({
    totalValoresVencidos: 0,
    totalPago: 0,
    totalEmAberto: 0
  });

  // Use the client filtered titles hook
  const clientFilteredTitles = useClientFilteredTitles(filteredTitles, selectedClient);

  // Handle exporting data to Excel
  const { handleExportToExcel } = useFinancialExport({
    activeTab,
    filteredTitles: clientFilteredTitles,
    filteredInvoices,
    clientFinancialSummaries: clientFinancialSummaries || []
  });

  // Create a derived data object for determining data availability
  const hasData = {
    titles: clientFilteredTitles.length > 0,
    clients: clientFinancialSummaries !== null && clientFinancialSummaries !== undefined && clientFinancialSummaries.length > 0,
    clientesVencidos: filteredTitles.length > 0,
    cobranca: filteredTitles.length > 0,
    origem: clientFilteredTitles.length > 0,
    cobrados: collectionRecords.length > 0
  };

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
          hasData={hasData}
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
