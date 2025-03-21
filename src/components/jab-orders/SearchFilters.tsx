
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

  const handleDateChange = (newDate: DateRange | undefined) => {
    console.log("Date selected in Calendar:", newDate);
    onDateChange(newDate);
  };

  const handleSearch = () => {
    console.log("Search button clicked with date:", date);
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
      <Select value={searchType} onValueChange={value => onSearchTypeChange(value as SearchType)}>
        <SelectTrigger className="w-full sm:w-[180px] bg-white">
          <SelectValue placeholder="Tipo de busca" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="pedido">Número do Pedido</SelectItem>
          <SelectItem value="cliente">Nome do Cliente</SelectItem>
          <SelectItem value="representante">Nome do Representante</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative w-full sm:w-auto flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 w-full bg-white"
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal w-full sm:w-[300px] bg-white",
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
        <PopoverContent className="w-auto p-0 bg-white" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className="bg-white pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <Button onClick={handleSearch} className="gap-2 w-full sm:w-auto bg-[#F97316] hover:bg-[#F97316]/90">
        <Search className="h-4 w-4" />
        Pesquisar
      </Button>
    </div>
  );
};

export default SearchFilters;
