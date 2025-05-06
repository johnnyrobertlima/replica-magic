
import { CalendarDays, RefreshCw, List, LayoutGrid, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EditorialLinePopover } from "@/components/oni_agencia/content-schedule/EditorialLinePopover";
import { ProductsPopover } from "@/components/oni_agencia/content-schedule/ProductsPopover";
import { Link } from "react-router-dom";
import { CalendarEvent } from "@/types/oni-agencia";

interface ControlPautaHeaderProps {
  filteredSchedules: CalendarEvent[];
  viewMode: "calendar" | "list";
  onViewChange: (value: string) => void;
  isRefetching: boolean;
  isLoadingSchedules: boolean;
  isFetchingNextPage: boolean;
  onManualRefetch: () => void;
}

export function ControlPautaHeader({
  filteredSchedules,
  viewMode,
  onViewChange,
  isRefetching,
  isLoadingSchedules,
  isFetchingNextPage,
  onManualRefetch
}: ControlPautaHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <CalendarDays className="h-6 w-6 text-primary" />
      <h1 className="text-2xl font-semibold tracking-tight">Controle de Pauta</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          title="Visualização para dispositivos móveis"
        >
          <Link to="/client-area/oniagencia/controle-pauta/visualizacaoemcampo">
            <Smartphone className="h-4 w-4 mr-1" />
            <span className="sr-md:inline hidden">Ver em campo</span>
          </Link>
        </Button>
        <ToggleGroup type="single" value={viewMode} onValueChange={onViewChange}>
          <ToggleGroupItem value="calendar" aria-label="Visualização em calendário" title="Visualização em calendário">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Visualização em lista" title="Visualização em lista">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <EditorialLinePopover events={filteredSchedules} />
        <ProductsPopover events={filteredSchedules} />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onManualRefetch}
          disabled={isRefetching || isLoadingSchedules}
          title="Atualizar agendamentos"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching || isFetchingNextPage ? 'animate-spin' : ''}`} />
          <span className="ml-2">Atualizar</span>
        </Button>
      </div>
    </div>
  );
}
