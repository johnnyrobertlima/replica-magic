
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { OniAgenciaClient } from "@/types/oni-agencia";
import { Loader2 } from "lucide-react";

interface ContentScheduleFiltersProps {
  selectedClient: string;
  selectedMonth: number;
  selectedYear: number;
  onClientChange: (clientId: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function ContentScheduleFilters({
  selectedClient,
  selectedMonth,
  selectedYear,
  onClientChange,
  onMonthChange,
  onYearChange
}: ContentScheduleFiltersProps) {
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  
  const getMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const date = new Date(2023, i - 1, 1);
      months.push({
        value: i.toString(),
        label: format(date, 'MMMM', { locale: ptBR })
      });
    }
    return months;
  };
  
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push({
        value: i.toString(),
        label: i.toString()
      });
    }
    
    return years;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-md border shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="client-select">Cliente</Label>
        <Select
          value={selectedClient}
          onValueChange={onClientChange}
        >
          <SelectTrigger id="client-select" className="w-full">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingClients ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Carregando clientes...</span>
              </div>
            ) : (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="month-select">Mês</Label>
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger id="month-select" className="w-full">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="year-select">Ano</Label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger id="year-select" className="w-full">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            {getYearOptions().map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
