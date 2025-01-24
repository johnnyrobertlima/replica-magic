import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Row"];

interface ClientSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  clients: ClientesWhats[];
}

export function ClientSelectField({ value, onChange, clients }: ClientSelectFieldProps) {
  return (
    <div>
      <Label htmlFor="client">Cliente</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}