
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadAllItemsButton } from "@/components/bluebay_adm/item-management/LoadAllItemsButton";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp } from "lucide-react";
import { exportItemsToExcel } from "@/services/bluebay_adm/itemExportService";
import { ChangeEvent, useRef } from "react";

interface ItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  empresaFilter: string;
  onEmpresaFilterChange: (value: string) => void;
  groups: any[];
  empresas: string[];
  onLoadAllItems: () => void;
  isLoadingAll: boolean;
  onExportItems?: () => void;
  onImportItems?: (file: File) => void;
}

export const ItemFilters = ({
  searchTerm,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  empresaFilter,
  onEmpresaFilterChange,
  groups,
  empresas,
  onLoadAllItems,
  isLoadingAll,
  onExportItems,
  onImportItems
}: ItemFiltersProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportItems) {
      onImportItems(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 bg-card p-4 rounded-md border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por código ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={groupFilter} onValueChange={onGroupFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.GRU_CODIGO} value={group.GRU_CODIGO}>
                  {group.GRU_DESCRICAO}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-64">
          <Select value={empresaFilter} onValueChange={onEmpresaFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa} value={empresa}>
                  {empresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <LoadAllItemsButton 
          onClick={onLoadAllItems} 
          isLoading={isLoadingAll} 
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onExportItems}
          >
            <FileDown className="h-4 w-4" />
            Exportar Itens
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleImportButtonClick}
          >
            <FileUp className="h-4 w-4" />
            Atualizar Itens
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
