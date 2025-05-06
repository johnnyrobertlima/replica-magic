
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
import { useCollaborators, useServices } from "@/hooks/useOniAgenciaContentSchedules";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  isCollapsed = false,
  onToggleCollapse,
  hideClientFilter = false
}: ContentScheduleFiltersProps) {
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  
  const [openServiceSelect, setOpenServiceSelect] = useState(false);
  const [localSelectedServices, setLocalSelectedServices] = useState<string[]>(selectedServiceIds);
  
  useEffect(() => {
    setLocalSelectedServices(selectedServiceIds);
  }, [selectedServiceIds]);
  
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
  
  const handleServiceChange = (serviceId: string) => {
    let newSelectedServices: string[];
    
    if (serviceId === "all") {
      // If "all" is clicked, toggle between all selected and none selected
      if (localSelectedServices.length === services.length) {
        newSelectedServices = [];
      } else {
        newSelectedServices = services.map(service => service.id);
      }
    } else {
      // Toggle individual service selection
      newSelectedServices = [...localSelectedServices];
      const index = newSelectedServices.indexOf(serviceId);
      
      if (index === -1) {
        newSelectedServices.push(serviceId);
      } else {
        newSelectedServices.splice(index, 1);
      }
    }
    
    setLocalSelectedServices(newSelectedServices);
    if (onServicesChange) {
      onServicesChange(newSelectedServices);
    }
  };
  
  const getSelectedServicesDisplay = () => {
    if (localSelectedServices.length === 0) {
      return "Nenhum serviço selecionado";
    }
    
    if (localSelectedServices.length === services.length) {
      return "Todos os serviços";
    }
    
    return `${localSelectedServices.length} serviços selecionados`;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-b-md border shadow-sm">
          {!hideClientFilter && (
            <div className="space-y-2">
              <Label htmlFor="client-select">Cliente</Label>
              <Select
                value={selectedClient === "" ? "all" : selectedClient}
                onValueChange={(value) => onClientChange(value === "all" ? "" : value)}
              >
                <SelectTrigger id="client-select" className="w-full bg-white">
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
              <SelectTrigger id="collaborator-select" className="w-full bg-white">
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
            <Label htmlFor="service-select">Serviços</Label>
            <div className="relative">
              <Button 
                variant="outline" 
                role="combobox" 
                aria-expanded={openServiceSelect}
                className="w-full justify-between bg-white"
                onClick={() => setOpenServiceSelect(!openServiceSelect)}
              >
                {getSelectedServicesDisplay()}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              {openServiceSelect && (
                <div className="absolute top-full left-0 w-full z-10 bg-white border border-gray-200 rounded-md shadow-md mt-1 p-1 max-h-60 overflow-auto">
                  <div className="p-1">
                    <div
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleServiceChange("all")}
                    >
                      <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                        localSelectedServices.length === services.length ? "bg-primary border-primary" : "border-gray-300"
                      }`}>
                        {localSelectedServices.length === services.length && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.33332 2.5L3.74999 7.08333L1.66666 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">Todos os serviços</span>
                    </div>
                    
                    {isLoadingServices ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Carregando...</span>
                      </div>
                    ) : (
                      services.map(service => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleServiceChange(service.id)}
                        >
                          <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                            localSelectedServices.includes(service.id) ? "bg-primary border-primary" : "border-gray-300"
                          }`}>
                            {localSelectedServices.includes(service.id) && (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.33332 2.5L3.74999 7.08333L1.66666 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-sm">{service.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {localSelectedServices.length > 0 && localSelectedServices.length < services.length && (
              <div className="flex flex-wrap gap-1 mt-1">
                {localSelectedServices.slice(0, 3).map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  return service ? (
                    <Badge key={serviceId} variant="secondary" className="text-xs">
                      {service.name}
                    </Badge>
                  ) : null;
                })}
                {localSelectedServices.length > 3 && (
                  <Badge variant="secondary" className="text-xs">+{localSelectedServices.length - 3}</Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="month-select">Mês</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => onMonthChange(parseInt(value))}
              >
                <SelectTrigger id="month-select" className="w-full bg-white">
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
                <SelectTrigger id="year-select" className="w-full bg-white">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
