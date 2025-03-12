
import type { DateRange } from "react-day-picker";
import type { SearchType } from "./SearchFilters";
import { SearchFilters } from "./SearchFilters";

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
}: OrdersHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Separação de Pedidos JAB</h1>
        <p className="text-muted-foreground">
          {totalCount > 0 ? (
            `Exibindo página ${currentPage} de ${totalPages} (Total: ${totalCount} pedidos)`
          ) : (
            "Nenhum pedido encontrado"
          )}
        </p>
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
  );
};
