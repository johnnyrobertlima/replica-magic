
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ClientSelectProps {
  clients: any[];
  isLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

export function ClientSelect({ 
  clients, 
  isLoading, 
  value, 
  onValueChange,
  required = false,
  label = "Cliente"
}: ClientSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="client_id" className="flex items-center">
        {label}
        {required && !value && (
          <span className="text-red-500 ml-1 text-sm">Campo obrigatório</span>
        )}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        required={required}
      >
        <SelectTrigger 
          id="client_id"
          className={`w-full ${required && !value ? "border-red-300" : ""}`}
        >
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : (
            clients.map((client) => (
              <SelectItem 
                key={client.id} 
                value={client.id}
              >
                {client.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
