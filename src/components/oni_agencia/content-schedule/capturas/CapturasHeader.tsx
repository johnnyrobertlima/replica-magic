
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEvent } from "@/types/oni-agencia";

interface CapturasHeaderProps {
  filteredSchedules: CalendarEvent[];
  viewMode: "calendar" | "list";
  onViewChange: (value: string) => void;
  isRefetching: boolean;
  isLoadingSchedules: boolean;
  isFetchingNextPage: boolean;
  onManualRefetch: () => void;
}

export function CapturasHeader({
  filteredSchedules,
  viewMode,
  onViewChange,
  isRefetching,
  isLoadingSchedules,
  isFetchingNextPage,
  onManualRefetch
}: CapturasHeaderProps) {
  // Count agendamentos with capture dates
  const countWithCaptureDate = filteredSchedules.filter(event => event.capture_date).length;
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div>
        <h1 className="text-2xl font-bold">Agendamentos de Capturas</h1>
        <p className="text-muted-foreground">
          {countWithCaptureDate} agendamentos de capturas encontrados
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Select
          value={viewMode}
          onValueChange={onViewChange}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Visualização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendar">Calendário</SelectItem>
            <SelectItem value="list">Lista</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onManualRefetch}
          disabled={isRefetching || isLoadingSchedules || isFetchingNextPage}
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
