
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileSpreadsheet, Wallet } from "lucide-react";

interface FinancialHeaderProps {
  title: string;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
  activeTab: string;
  hasData: {
    titles: boolean;
    invoices: boolean;
    clients: boolean;
  };
}

export const FinancialHeader: React.FC<FinancialHeaderProps> = ({
  title,
  onRefresh,
  onExport,
  isLoading,
  activeTab,
  hasData
}) => {
  const isExportDisabled = isLoading || (
    (activeTab === 'titles' && !hasData.titles) || 
    (activeTab === 'invoices' && !hasData.invoices) || 
    (activeTab === 'clients' && !hasData.clients)
  );

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onExport} 
          disabled={isExportDisabled}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
};
