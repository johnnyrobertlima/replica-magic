
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, RefreshCw, FileSpreadsheet } from "lucide-react";

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
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex gap-2">
        <Link to="/client-area/bk/clientefinancial">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Visão por Cliente
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={onExport} 
          disabled={isExportDisabled}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>
  );
};
