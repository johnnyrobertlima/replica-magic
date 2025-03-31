
import React from "react";
import { FinancialSummaryCards } from "@/components/bluebay_adm/financial/FinancialSummaryCards";
import { FinancialFilters } from "@/components/bluebay_adm/financial/FinancialFilters";
import { ClientFilterSection } from "@/components/bluebay_adm/financial/ClientFilterSection";
import { FinancialTabs } from "@/components/bluebay_adm/financial/FinancialTabs";
import { TitleTable } from "@/components/bluebay_adm/financial/TitleTable";
import { OrigemTable } from "@/components/bluebay_adm/financial/OrigemTable";
import { ClientFinancialTable } from "@/components/bluebay_adm/financial/ClientFinancialTable";
import { ClientesVencidosTable } from "@/components/bluebay_adm/financial/ClientesVencidosTable";
import { CobrancaTable } from "@/components/bluebay_adm/financial/CobrancaTable";
import { DateRange } from "@/hooks/bk/financial/types";
import { ClientFinancialSummary } from "@/hooks/bluebay/useFinancialFilters";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";

interface FinancialContentProps {
  isLoading: boolean;
  filteredSummary: {
    totalValoresVencidos: number;
    totalPago: number;
    totalEmAberto: number;
  };
  selectedClient: string | null;
  statusFilter: string;
  updateStatusFilter: (status: string) => void;
  availableStatuses: string[];
  clientFilter: string;
  updateClientFilter: (client: string) => void;
  notaFilter: string;
  updateNotaFilter: (nota: string) => void;
  dateRange: DateRange;
  updateDateRange: (dateRange: DateRange) => void;
  handleResetClientSelection: () => void;
  handleClientSelect: (clientCode: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  clientFilteredTitles: FinancialTitle[];
  filteredTitles: FinancialTitle[];
  clientFinancialSummaries: ClientFinancialSummary[] | null;
}

export const FinancialContent: React.FC<FinancialContentProps> = ({
  isLoading,
  filteredSummary,
  selectedClient,
  statusFilter,
  updateStatusFilter,
  availableStatuses,
  clientFilter,
  updateClientFilter,
  notaFilter,
  updateNotaFilter,
  dateRange,
  updateDateRange,
  handleResetClientSelection,
  handleClientSelect,
  activeTab,
  setActiveTab,
  clientFilteredTitles,
  filteredTitles,
  clientFinancialSummaries
}) => {
  return (
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
      
      <ClientFilterSection
        selectedClient={selectedClient}
        onResetClientSelection={handleResetClientSelection}
      />
      
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
            id: "origem",
            label: "Origem",
            content: (
              <>
                <h2 className="text-xl font-semibold mb-4">Origem dos Títulos</h2>
                <OrigemTable 
                  titles={clientFilteredTitles} 
                  isLoading={isLoading} 
                  onViewTitles={handleClientSelect}
                />
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
                  clients={clientFinancialSummaries || []} 
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
          },
          {
            id: "cobranca",
            label: "Cobrança",
            content: (
              <>
                <h2 className="text-xl font-semibold mb-4">Cobrança - Valores Consolidados</h2>
                <CobrancaTable
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
  );
};
