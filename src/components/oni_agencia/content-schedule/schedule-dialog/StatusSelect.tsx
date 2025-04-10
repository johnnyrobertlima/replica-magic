
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Status } from "@/pages/admin/sub-themes/types";
import { Loader2 } from "lucide-react";

interface StatusSelectProps {
  statuses: Status[];
  isLoading: boolean;
  value: string | null;
  onValueChange: (value: string) => void;
}

export function StatusSelect({ 
  statuses, 
  isLoading, 
  value, 
  onValueChange 
}: StatusSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="status_id">Status</Label>
      <Select
        value={value || "null"}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="status_id" className="w-full">
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">Nenhum</SelectItem>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span>Carregando...</span>
            </div>
          ) : (
            statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
