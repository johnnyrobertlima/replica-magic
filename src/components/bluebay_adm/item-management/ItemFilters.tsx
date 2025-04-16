
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadAllItemsButton } from "@/components/bluebay_adm/item-management/LoadAllItemsButton";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, X, Filter, Check } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string | string[];
  onGroupFilterChange: (value: string | string[]) => void;
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
  const [groupsOpen, setGroupsOpen] = useState(false);

  // Deduplicate groups by gru_codigo to ensure unique entries
  const uniqueGroups = Array.from(
    new Map(groups.map(group => [group.gru_codigo || `group-${group.id}`, group])).values()
  );

  const selectedGroups = Array.isArray(groupFilter) 
    ? groupFilter 
    : (groupFilter !== "all" ? [groupFilter] : []);

  const handleGroupSelect = (value: string, checked: boolean) => {
    let newSelectedGroups: string[];
    
    if (value === "all") {
      newSelectedGroups = checked ? [] : [];
      onGroupFilterChange(checked ? "all" : []);
      return;
    }
    
    if (checked) {
      newSelectedGroups = [...selectedGroups, value];
    } else {
      newSelectedGroups = selectedGroups.filter(group => group !== value);
    }
    
    onGroupFilterChange(newSelectedGroups.length === 0 ? "all" : newSelectedGroups);
  };

  const clearGroupSelection = () => {
    onGroupFilterChange("all");
  };

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

  const getSelectedGroupsLabel = () => {
    if (groupFilter === "all" || (Array.isArray(groupFilter) && groupFilter.length === 0)) {
      return "Todos os grupos";
    }
    
    if (Array.isArray(groupFilter) && groupFilter.length === 1) {
      const selectedGroup = uniqueGroups.find(g => 
        (g.gru_codigo || `group-${g.id}`) === groupFilter[0]
      );
      return selectedGroup ? selectedGroup.gru_descricao : "Grupo selecionado";
    }
    
    if (Array.isArray(groupFilter)) {
      return `${groupFilter.length} grupos selecionados`;
    }
    
    // For a single string value that is not "all"
    const selectedGroup = uniqueGroups.find(g => 
      (g.gru_codigo || `group-${g.id}`) === groupFilter
    );
    return selectedGroup ? selectedGroup.gru_descricao : "Grupo selecionado";
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
          <Popover open={groupsOpen} onOpenChange={setGroupsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={groupsOpen}
                className="w-full justify-between"
              >
                <div className="flex items-center gap-1 truncate">
                  <Filter className="h-4 w-4 opacity-50 mr-2" />
                  <span className="truncate">{getSelectedGroupsLabel()}</span>
                </div>
                {Array.isArray(groupFilter) && groupFilter.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 ml-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearGroupSelection();
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Limpar seleção</span>
                  </Button>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar grupo..." className="h-9" />
                <CommandEmpty>Nenhum grupo encontrado</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-64">
                    <CommandItem
                      onSelect={() => {
                        handleGroupSelect("all", groupFilter !== "all");
                        setGroupsOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={groupFilter === "all"}
                        onCheckedChange={(checked) => {
                          handleGroupSelect("all", checked as boolean);
                          setGroupsOpen(false);
                        }}
                      />
                      <span>Todos os grupos</span>
                    </CommandItem>
                    
                    {uniqueGroups.map((group) => {
                      const value = group.gru_codigo || `group-${group.id}`;
                      const isSelected = Array.isArray(groupFilter) && groupFilter.includes(value);
                      
                      return (
                        <CommandItem
                          key={value}
                          onSelect={() => {
                            handleGroupSelect(value, !isSelected);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              handleGroupSelect(value, checked as boolean);
                            }}
                          />
                          <span>{group.gru_descricao}</span>
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
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
                  value={empresa || "sem-empresa"} // Ensure we never pass an empty string
                >
                  {empresa || "Sem empresa"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {Array.isArray(groupFilter) && groupFilter.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {groupFilter.map(groupCode => {
            const group = uniqueGroups.find(g => (g.gru_codigo || `group-${g.id}`) === groupCode);
            if (!group) return null;
            
            return (
              <Badge key={groupCode} variant="secondary" className="flex items-center gap-1">
                {group.gru_descricao}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 ml-1" 
                  onClick={() => handleGroupSelect(groupCode, false)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remover</span>
                </Button>
              </Badge>
            );
          })}
          {groupFilter.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs" 
              onClick={clearGroupSelection}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

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
