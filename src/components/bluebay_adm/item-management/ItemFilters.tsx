
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadAllItemsButton } from "./LoadAllItemsButton";

interface ItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  empresaFilter: string;
  onEmpresaFilterChange: (value: string) => void;
  groups: any[];
  empresas: string[];
  onLoadAllItems?: () => Promise<void>;
  isLoadingAll?: boolean;
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
  isLoadingAll = false,
}: ItemFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-end">
      <div className="flex-1">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Buscar por código ou descrição"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="w-full md:w-48">
        <Label htmlFor="group-filter">Grupo</Label>
        <Select value={groupFilter} onValueChange={onGroupFilterChange}>
          <SelectTrigger id="group-filter">
            <SelectValue placeholder="Todos os grupos" />
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

      <div className="w-full md:w-48">
        <Label htmlFor="empresa-filter">Empresa</Label>
        <Select value={empresaFilter} onValueChange={onEmpresaFilterChange}>
          <SelectTrigger id="empresa-filter">
            <SelectValue placeholder="Todas as empresas" />
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

      {onLoadAllItems && (
        <div className="w-full md:w-auto">
          <LoadAllItemsButton 
            onLoadAll={onLoadAllItems} 
            isLoading={isLoadingAll} 
          />
        </div>
      )}
    </div>
  );
};
