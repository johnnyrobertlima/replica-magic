
import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  RefreshCw, 
  Search, 
  Filter, 
  X,
  Calendar 
} from "lucide-react";
import { DateRange } from "@/hooks/bluebay_adm/useStockSalesAnalytics";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface StockSalesFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  availableGroups: string[];
  onRefresh: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
  minCadastroYear: string;
  onMinCadastroYearChange: (value: string) => void;
  showZeroStock: boolean;
  onShowZeroStockChange: (value: boolean) => void;
}

export const StockSalesFilters: React.FC<StockSalesFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  searchTerm,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  availableGroups,
  onRefresh,
  onClearFilters,
  isLoading,
  minCadastroYear,
  onMinCadastroYearChange,
  showZeroStock,
  onShowZeroStockChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <DatePickerWithRange 
            dateRange={{
              from: dateRange.startDate,
              to: dateRange.endDate
            }}
            onDateRangeChange={(range) => {
              onDateRangeChange({
                startDate: range.from,
                endDate: range.to
              });
            }}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1"
            title="Limpar filtros"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por código ou descrição..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={groupFilter}
            onValueChange={onGroupFilterChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {availableGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* New filters for cadastro date and stock items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-3 rounded-md">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select
            value={minCadastroYear}
            onValueChange={onMinCadastroYearChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ano mínimo de cadastro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              <SelectItem value="2022">A partir de 2022</SelectItem>
              <SelectItem value="2023">A partir de 2023</SelectItem>
              <SelectItem value="2024">A partir de 2024</SelectItem>
              <SelectItem value="2025">A partir de 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-zero-stock" 
              checked={showZeroStock}
              onCheckedChange={onShowZeroStockChange}
            />
            <Label htmlFor="show-zero-stock">Apresentar itens com estoque físico = 0</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
