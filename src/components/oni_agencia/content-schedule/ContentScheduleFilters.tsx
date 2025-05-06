
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
import { ChevronUp, ChevronDown, Calendar } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useCollaborators } from "@/hooks/useOniAgenciaContentSchedules";
import { ServiceMultiSelect } from "./ServiceMultiSelect";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ContentScheduleFiltersProps {
  selectedClient: string;
  selectedMonth: number;
  selectedYear: number;
  selectedCollaborator?: string | null;
  selectedServiceIds?: string[];
  onClientChange: (clientId: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onCollaboratorChange?: (collaboratorId: string | null) => void;
  onServicesChange?: (serviceIds: string[]) => void;
  onPeriodChange?: (month: number, year: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  hideClientFilter?: boolean; // Optional prop
}

export function ContentScheduleFilters({
  selectedClient,
  selectedMonth,
  selectedYear,
  selectedCollaborator,
  selectedServiceIds = [],
  onClientChange,
  onMonthChange,
  onYearChange,
  onCollaboratorChange,
  onServicesChange,
  onPeriodChange,
  isCollapsed = false,
  onToggleCollapse,
  hideClientFilter = false
}: ContentScheduleFiltersProps) {
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const [dateOpen, setDateOpen] = useState(false);
  
  // Generate the month names for selection
  const getMonthNames = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2023, i, 1);
      months.push(format(date, 'LLLL', { locale: ptBR }));
    }
    return months;
  };

  const monthNames = getMonthNames();
  
  const handleCollaboratorChange = (value: string) => {
    if (onCollaboratorChange) {
      onCollaboratorChange(value === "all" ? null : value);
    }
  };
  
  const handleServicesChange = (serviceIds: string[]) => {
    if (onServicesChange) {
      onServicesChange(serviceIds);
    }
  };
  
  // Handle month selection in date picker
  const handleMonthSelection = (monthIndex: number) => {
    const newMonth = monthIndex + 1; // Convert from 0-based to 1-based
    if (onPeriodChange) {
      onPeriodChange(newMonth, selectedYear);
    } else {
      onMonthChange(newMonth);
    }
    setDateOpen(false);
  };

  // Handle year selection in date picker
  const handleYearSelection = (year: number) => {
    if (onPeriodChange) {
      onPeriodChange(selectedMonth, year);
    } else {
      onYearChange(year);
    }
    setDateOpen(false);
  };

  // Generate years array for selection
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2
    ];
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-b-md border shadow-sm">
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
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Carregando...</span>
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
            <Label htmlFor="service-select">Tipo de conteúdo</Label>
            <ServiceMultiSelect 
              value={selectedServiceIds}
              onChange={handleServicesChange}
              placeholder="Selecione tipos de conteúdo..."
              className="content-type-select"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period-select">Período</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="period-select"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white",
                    !selectedMonth && !selectedYear && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedMonth && selectedYear ? (
                    <>
                      {monthNames[selectedMonth - 1]} de {selectedYear}
                    </>
                  ) : (
                    <span>Selecione mês/ano...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 bg-white" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Mês</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {monthNames.map((month, i) => (
                        <Button
                          key={i}
                          variant={selectedMonth === i + 1 ? "default" : "outline"}
                          size="sm"
                          className="bg-white hover:bg-gray-100"
                          onClick={() => handleMonthSelection(i)}
                        >
                          {month}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Ano</h4>
                    <div className="flex gap-2">
                      {getYears().map((year) => (
                        <Button
                          key={year}
                          variant={selectedYear === year ? "default" : "outline"}
                          size="sm"
                          className="bg-white hover:bg-gray-100"
                          onClick={() => handleYearSelection(year)}
                        >
                          {year}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
