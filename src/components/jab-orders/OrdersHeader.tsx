
import type { DateRange } from "react-day-picker";
import type { SearchType } from "./SearchFilters";
import SearchFilters from "./SearchFilters";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
            <Select 
              value={selectedStatuses.length > 0 ? selectedStatuses[0] : 'all'} 
              onValueChange={(value) => onStatusChange(value as OrderStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="0">0 - Bloqueado</SelectItem>
                <SelectItem value="1">1 - Aberto</SelectItem>
                <SelectItem value="2">2 - Parcial</SelectItem>
                <SelectItem value="3">3 - Total</SelectItem>
                <SelectItem value="4">4 - Cancelado</SelectItem>
              </SelectContent>
            </Select>
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
