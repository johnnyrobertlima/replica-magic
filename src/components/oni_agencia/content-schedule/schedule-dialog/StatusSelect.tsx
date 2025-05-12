
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface StatusSelectProps {
  statuses: any[];
  isLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string;
}

export function StatusSelect({ 
  statuses, 
  isLoading, 
  value, 
  onValueChange,
  errorMessage
}: StatusSelectProps) {
  // Handle case when statuses fail to load but we're not in loading state anymore
  const hasError = !isLoading && statuses.length === 0;

  return (
    <div className="grid gap-2">
      <Label htmlFor="status_id">Status</Label>
      <Select 
        value={value || "null"} 
        onValueChange={onValueChange}
        disabled={isLoading || hasError}
      >
        <SelectTrigger 
          id="status_id" 
          className={`w-full ${hasError ? 'border-red-300' : ''}`}
        >
          <SelectValue placeholder={
            hasError 
              ? (errorMessage || "Erro ao carregar status") 
              : "Selecione um status"
          } />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : statuses.length === 0 ? (
            <div className="p-2 text-sm text-red-500">
              Não foi possível carregar os status
            </div>
          ) : (
            statuses.map((status) => (
              <SelectItem 
                key={status.id} 
                value={status.id}
                className="flex items-center"
              >
                <div className="flex items-center gap-2">
                  {status.color && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                  )}
                  {status.name}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {errorMessage && hasError && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
