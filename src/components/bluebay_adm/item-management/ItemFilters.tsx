
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadAllItemsButton } from "@/components/bluebay_adm/item-management/LoadAllItemsButton";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, X } from "lucide-react";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface ItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string[];
  onGroupFilterChange: (value: string[]) => void;
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
  const [currentGroupSelection, setCurrentGroupSelection] = useState<string>("all");
  const [uniqueGroups, setUniqueGroups] = useState<any[]>([]);

  // Process groups to ensure uniqueness by gru_descricao
  useEffect(() => {
    if (groups.length > 0) {
      const uniqueGroupsMap = new Map();
      groups.forEach(group => {
        if (group.gru_descricao && !uniqueGroupsMap.has(group.gru_descricao)) {
          uniqueGroupsMap.set(group.gru_descricao, group);
        }
      });
      const uniqueGroupsArray = Array.from(uniqueGroupsMap.values());
      uniqueGroupsArray.sort((a, b) => a.gru_descricao.localeCompare(b.gru_descricao));
      setUniqueGroups(uniqueGroupsArray);
    }
  }, [groups]);

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

  const handleGroupSelectionChange = (value: string) => {
    setCurrentGroupSelection(value);
    
    if (value === "all") {
      // If "all" is selected, clear all filters
      onGroupFilterChange([]);
    } else {
      // Add the selected group to the filter if it's not already there
      if (!groupFilter.includes(value)) {
        onGroupFilterChange([...groupFilter, value]);
      }
    }
  };

  const removeGroupFilter = (value: string) => {
    onGroupFilterChange(groupFilter.filter(group => group !== value));
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
          <Select value={currentGroupSelection} onValueChange={handleGroupSelectionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {uniqueGroups.map((group) => (
                <SelectItem 
                  key={group.id || group.gru_codigo} 
                  value={group.gru_codigo || `group-${group.id}`}
                >
                  {group.gru_descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {groupFilter.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {groupFilter.map(group => {
                const groupObj = uniqueGroups.find(g => g.gru_codigo === group || `group-${g.id}` === group);
                const label = groupObj ? groupObj.gru_descricao : group;
                
                return (
                  <Badge key={group} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeGroupFilter(group)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-full md:w-64">
          <Select value={empresaFilter} onValueChange={onEmpresaFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem 
                  key={empresa || "sem-empresa"} 
                  value={empresa || "sem-empresa"}
                >
                  {empresa || "Sem empresa"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <LoadAllItemsButton 
          onLoadAll={onLoadAllItems} 
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
