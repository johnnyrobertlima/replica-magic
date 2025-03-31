
import React from "react";
import { FinancialTabs } from "./FinancialTabs";
import { TitleTable } from "./TitleTable";
import { InvoiceTable } from "./InvoiceTable";
import { ClientFinancialTable } from "./ClientFinancialTable";
import { ClientesVencidosTable } from "./ClientesVencidosTable";
import { CobrancaTable } from "./CobrancaTable";
import { CollectedTitlesTable } from "./CollectedTitlesTable";
import { OrigemTable } from "./OrigemTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { DateRange } from "@/hooks/bluebay/types/financialTypes";

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
  clientFilteredTitles: any[];
  filteredTitles: any[];
  clientFinancialSummaries: any[] | null;
  collectedClients?: string[];
  collectionRecords?: any[];
  showCollectedOnly?: boolean;
  onToggleCollectedView?: () => void;
  onCollectionStatusChange?: (clientCode: string, clientName: string, status: string) => void;
  onResetCollectionStatus?: (clientCode: string) => void;
  onResetAllCollectionStatus?: () => void;
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
  clientFinancialSummaries,
  collectedClients = [],
  collectionRecords = [],
  showCollectedOnly = false,
  onToggleCollectedView,
  onCollectionStatusChange,
  onResetCollectionStatus,
  onResetAllCollectionStatus
}) => {
  const tabs = [
    {
      id: "titles",
      label: "Títulos",
      content: (
        <TitleTable
          titles={clientFilteredTitles}
          isLoading={isLoading}
        />
      )
    },
    {
      id: "clients",
      label: "Clientes",
      content: (
        <ClientFinancialTable
          clients={clientFinancialSummaries || []}
          isLoading={isLoading}
          onClientSelect={handleClientSelect}
        />
      )
    },
    {
      id: "clientesVencidos",
      label: "Clientes Vencidos",
      content: (
        <ClientesVencidosTable
          titles={filteredTitles}
          isLoading={isLoading}
          onClientSelect={handleClientSelect}
        />
      )
    },
    {
      id: "cobranca",
      label: "Cobrança",
      content: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleCollectedView}
            >
              {showCollectedOnly ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Ver Pendentes
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Cobrados
                </>
              )}
            </Button>
          </div>
          
          <CobrancaTable
            titles={filteredTitles}
            isLoading={isLoading}
            onClientSelect={handleClientSelect}
            onCollectionStatusChange={(clientCode, status) => {
              const client = filteredTitles.find(t => String(t.PES_CODIGO) === clientCode);
              if (client && onCollectionStatusChange) {
                onCollectionStatusChange(clientCode, client.CLIENTE_NOME, status);
              }
            }}
            collectedClients={collectedClients}
            showCollected={showCollectedOnly}
          />
        </div>
      )
    },
    {
      id: "cobrados",
      label: "Cobrados",
      content: (
        <CollectedTitlesTable
          records={collectionRecords}
          onResetRecord={onResetCollectionStatus || (() => {})}
          onResetAll={onResetAllCollectionStatus || (() => {})}
        />
      )
    },
    {
      id: "origem",
      label: "Origem",
      content: (
        <OrigemTable
          titles={clientFilteredTitles}
          isLoading={isLoading}
        />
      )
    }
  ];

  return (
    <div className="space-y-4">
      {selectedClient && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetClientSelection}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para todos os clientes
          </Button>
        </div>
      )}

      <FinancialTabs
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value)}
        tabs={tabs}
      />
    </div>
  );
};
