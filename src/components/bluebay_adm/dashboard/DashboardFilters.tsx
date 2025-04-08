
import { useEffect } from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { useFilters } from "@/contexts/bluebay_adm/FiltersContext";
import { useDashboardFilters } from "@/hooks/bluebay_adm/dashboard/useDashboardFilters";
import { Button } from "@/components/ui/button";
import { DownloadIcon, RefreshCw } from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";

interface DashboardFiltersProps {
  onFilterChange: () => void;
}

export const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
  const { filters, updateDateRange, updateBrand, updateRepresentative, updateStatus } = useFilters();
  const { filterOptions, isLoading } = useDashboardFilters();

  const handleDateRangeChange = (range: DateRange) => {
    if (range.from && range.to) {
      updateDateRange(range.from, range.to);
    }
  };

  const handleExportData = () => {
    // This would export the data - implementation in exportUtils.ts
    alert("Função de exportação será implementada em breve");
  };

  useEffect(() => {
    onFilterChange();
  }, [filters, onFilterChange]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <DatePickerWithRange
              dateRange={{ from: filters.dateRange.startDate, to: filters.dateRange.endDate }}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
          
          <div>
            <Select
              value={filters.brand || ""}
              onValueChange={value => updateBrand(value === "" ? null : value)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Marca (Centrocusto)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Marcas</SelectItem>
                {filterOptions.brands.map(brand => (
                  <SelectItem key={brand.value} value={brand.value}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={filters.representative || ""}
              onValueChange={value => updateRepresentative(value === "" ? null : value)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Representante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Representantes</SelectItem>
                {filterOptions.representatives.map(rep => (
                  <SelectItem key={rep.value} value={rep.value}>
                    {rep.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={filters.status || ""}
              onValueChange={value => updateStatus(value === "" ? null : value)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status do Pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Status</SelectItem>
                {filterOptions.statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 col-span-1 lg:col-span-5">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="bg-white"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar Dados
            </Button>
            
            <Button 
              variant="default" 
              onClick={onFilterChange}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
