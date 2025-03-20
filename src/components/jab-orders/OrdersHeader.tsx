
import type { DateRange } from "react-day-picker";
import type { SearchType } from "./SearchFilters";
import SearchFilters from "./SearchFilters";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = '0' | '1' | '2' | '3' | '4' | 'all';

const statusLabels: Record<OrderStatus, string> = {
  '0': 'Bloqueado',
  '1': 'Aberto',
  '2': 'Parcial',
  '3': 'Total',
  '4': 'Cancelado',
  'all': 'Todos'
};

interface OrdersHeaderProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
  selectedStatuses: OrderStatus[];
  onStatusChange: (status: OrderStatus) => void;
}

export const OrdersHeader = ({
  currentPage,
  totalPages,
  totalCount,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  date,
  onDateChange,
  searchType,
  onSearchTypeChange,
  selectedStatuses,
  onStatusChange,
}: OrdersHeaderProps) => {
  const getStatusLabel = (status: OrderStatus) => {
    return `${status} - ${statusLabels[status]}`;
  };
  
  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Pedidos BK</h1>
          <p className="text-muted-foreground">
            {totalCount > 0 ? (
              `Exibindo página ${currentPage} de ${totalPages} (Total: ${totalCount} pedidos)`
            ) : (
              "Nenhum pedido encontrado"
            )}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedStatuses.length > 0 
                    ? `${selectedStatuses.length} status selecionados` 
                    : "Todos os status"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.length === 0}
                  onCheckedChange={() => onStatusChange('all')}
                >
                  Todos os status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('0')}
                  onCheckedChange={() => onStatusChange('0')}
                >
                  0 - Bloqueado
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('1')}
                  onCheckedChange={() => onStatusChange('1')}
                >
                  1 - Aberto
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('2')}
                  onCheckedChange={() => onStatusChange('2')}
                >
                  2 - Parcial
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('3')}
                  onCheckedChange={() => onStatusChange('3')}
                >
                  3 - Total
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.includes('4')}
                  onCheckedChange={() => onStatusChange('4')}
                >
                  4 - Cancelado
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {selectedStatuses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedStatuses.map(status => (
                  <Badge 
                    key={status} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getStatusLabel(status)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onStatusChange(status)}
                    />
                  </Badge>
                ))}
                {selectedStatuses.length > 1 && (
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => onStatusChange('all')}
                  >
                    Limpar todos
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <SearchFilters
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            onSearch={onSearch}
            date={date}
            onDateChange={onDateChange}
            searchType={searchType}
            onSearchTypeChange={onSearchTypeChange}
          />
        </div>
      </div>
    </div>
  );
};
