
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SearchType = "pedido" | "cliente" | "representante";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  searchType: SearchType;
  onSearchTypeChange: (value: SearchType) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  date,
  onDateChange,
  searchType,
  onSearchTypeChange,
}) => {
  const getPlaceholder = () => {
    switch (searchType) {
      case "pedido":
        return "Buscar por número do pedido";
      case "cliente":
        return "Buscar por nome do cliente";
      case "representante":
        return "Buscar por nome do representante";
      default:
        return "Buscar...";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Select value={searchType} onValueChange={value => onSearchTypeChange(value as SearchType)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de busca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pedido">Número do Pedido</SelectItem>
          <SelectItem value="cliente">Nome do Cliente</SelectItem>
          <SelectItem value="representante">Nome do Representante</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9 w-[250px]"
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal w-[300px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            className="bg-white" // This is the key change to fix the background issue
          />
        </PopoverContent>
      </Popover>

      <Button onClick={onSearch} className="gap-2">
        <Search className="h-4 w-4" />
        Pesquisar
      </Button>
    </div>
  );
};

export default SearchFilters;
