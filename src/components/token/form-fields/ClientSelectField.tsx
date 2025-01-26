import { FormField } from "@/components/token/form-fields/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ClientSelectField: FormField = ({ value, onChange }) => {
  const { data: clients } = useQuery({
    queryKey: ["clients-whats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Clientes_Whats")
        .select("id, nome")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="cliente">Cliente</Label>
      <Select
        value={value}
        onValueChange={onChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.nome}>
              {client.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};