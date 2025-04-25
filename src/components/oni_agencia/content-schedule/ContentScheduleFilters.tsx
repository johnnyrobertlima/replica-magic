
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
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useCollaborators } from "@/hooks/useOniAgenciaContentSchedules";
import { Loader2 } from "lucide-react";

interface ContentScheduleFiltersProps {
  selectedClient: string;
  selectedMonth: number;
  selectedYear: number;
  selectedCollaborator?: string | null;
  onClientChange: (clientId: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onCollaboratorChange?: (collaboratorId: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  hideClientFilter?: boolean; // New optional prop
}

export function ContentScheduleFilters({
  selectedClient,
  selectedMonth,
  selectedYear,
  selectedCollaborator,
  onClientChange,
  onMonthChange,
  onYearChange,
  onCollaboratorChange,
  isCollapsed = false,
  onToggleCollapse,
  hideClientFilter = false // Default to false
}: ContentScheduleFiltersProps) {
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  
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
  
  const handleCollaboratorChange = (value: string) => {
    if (onCollaboratorChange) {
      onCollaboratorChange(value === "all" ? null : value);
    }
  };
  
  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={open => onToggleCollapse && onToggleCollapse()}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-2 bg-white rounded-t-md border border-b-0 shadow-sm p-3">
        <h3 className="text-sm font-medium">Filtros</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-b-md border shadow-sm">
          {!hideClientFilter && (
            <div className="space-y-2">
              <Label htmlFor="client-select">Cliente</Label>
              <Select
                value={selectedClient === "" ? "all" : selectedClient}
                onValueChange={(value) => onClientChange(value === "all" ? "" : value)}
              >
                <SelectTrigger id="client-select" className="w-full">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="collaborator-select">Colaborador e Creator</Label>
            <Select
              value={selectedCollaborator || "all"}
              onValueChange={handleCollaboratorChange}
            >
              <SelectTrigger id="collaborator-select" className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {isLoadingCollaborators ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Carregando...</span>
                  </div>
                ) : (
                  collaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name}
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
      </CollapsibleContent>
    </Collapsible>
  );
}
