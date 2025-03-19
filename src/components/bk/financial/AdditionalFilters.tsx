
import React from 'react';
import { 
  Input 
} from "@/components/ui/input";
import { Label } from '@/components/ui/label';

interface AdditionalFiltersProps {
  clientFilter: string;
  onClientFilterChange: (value: string) => void;
  notaFilter: string;
  onNotaFilterChange: (value: string) => void;
}

export const AdditionalFilters: React.FC<AdditionalFiltersProps> = ({ 
  clientFilter, 
  onClientFilterChange,
  notaFilter,
  onNotaFilterChange
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-full md:w-auto">
        <Label htmlFor="client-filter" className="text-sm font-medium mb-1 block">
          Cliente
        </Label>
        <Input
          id="client-filter"
          value={clientFilter}
          onChange={(e) => onClientFilterChange(e.target.value)}
          placeholder="Filtrar por cliente"
          className="h-9 w-full md:w-[200px]"
        />
      </div>
      
      <div className="w-full md:w-auto">
        <Label htmlFor="nota-filter" className="text-sm font-medium mb-1 block">
          Nota
        </Label>
        <Input
          id="nota-filter"
          value={notaFilter}
          onChange={(e) => onNotaFilterChange(e.target.value)}
          placeholder="Filtrar por número da nota"
          className="h-9 w-full md:w-[200px]"
        />
      </div>
    </div>
  );
};
