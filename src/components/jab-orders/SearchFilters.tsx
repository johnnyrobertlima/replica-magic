
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "react-day-picker";

export type SearchType = "cliente" | "pedido" | "item" | "representante";

interface SearchFiltersProps {
  searchQuery: string;
  searchType: SearchType;
  onSearchQueryChange: (query: string) => void;
  onSearchTypeChange: (type: SearchType) => void;
  onSearch: () => void;
  date?: DateRange | undefined;
  onDateChange?: (date: DateRange | undefined) => void;
}

export const SearchFilters = ({
  searchQuery,
  searchType,
  onSearchQueryChange,
  onSearchTypeChange,
  onSearch,
  // We add the new props but don't use them yet - they'll be implemented later if needed
  date,
  onDateChange
}: SearchFiltersProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
      <div className="w-full md:w-auto md:flex-1">
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-auto">
        <Select
          value={searchType}
          onValueChange={(value) => onSearchTypeChange(value as SearchType)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipo de busca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="pedido">Nº Pedido</SelectItem>
            <SelectItem value="item">Item</SelectItem>
            <SelectItem value="representante">Representante</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSearch} className="w-full md:w-auto">
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </div>
  );
};
