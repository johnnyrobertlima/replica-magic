
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SearchBar } from "../financial/SearchBar";

interface ReportTableActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onExportExcel: () => void;
}

export const ReportTableActions = ({
  searchTerm,
  onSearchChange,
  onExportExcel
}: ReportTableActionsProps) => {
  return (
    <div className="flex items-center justify-between">
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Buscar por código, descrição ou grupo do item..."
      />
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={onExportExcel}
      >
        <Download className="h-4 w-4" />
        Exportar Excel
      </Button>
    </div>
  );
};
