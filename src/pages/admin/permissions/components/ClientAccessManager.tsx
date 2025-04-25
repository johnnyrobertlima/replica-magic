
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ClientAccessManagerProps {
  selectedGroupId: string;
  onAccessUpdate: () => void;
}

export const ClientAccessManager = ({ selectedGroupId, onAccessUpdate }: ClientAccessManagerProps) => {
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["oni_agencia_clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oni_agencia_clients")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGroupId,
  });

  const { data: accessConfig, isLoading: isLoadingAccess } = useQuery({
    queryKey: ["group_client_access", selectedGroupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_client_access")
        .select("*")
        .eq("group_id", selectedGroupId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGroupId,
  });

  const handleAllClientsChange = async (checked: boolean) => {
    if (!selectedGroupId) return;

    if (checked) {
      // Remover acessos individuais e adicionar acesso a todos
      await supabase
        .from("group_client_access")
        .delete()
        .eq("group_id", selectedGroupId);

      await supabase
        .from("group_client_access")
        .insert({
          group_id: selectedGroupId,
          all_clients: true,
        });
    } else {
      // Remover acesso a todos
      await supabase
        .from("group_client_access")
        .delete()
        .eq("group_id", selectedGroupId)
        .eq("all_clients", true);
    }

    onAccessUpdate();
  };

  const handleClientAccessChange = async (clientId: string, checked: boolean) => {
    if (!selectedGroupId) return;

    if (checked) {
      await supabase
        .from("group_client_access")
        .insert({
          group_id: selectedGroupId,
          client_id: clientId,
          all_clients: false,
        });
    } else {
      await supabase
        .from("group_client_access")
        .delete()
        .eq("group_id", selectedGroupId)
        .eq("client_id", clientId);
    }

    onAccessUpdate();
  };

  if (isLoadingClients || isLoadingAccess) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasAllClientsAccess = accessConfig?.some(config => config.all_clients) ?? false;
  const clientAccess = new Set(accessConfig?.filter(config => !config.all_clients).map(config => config.client_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="all-clients"
          checked={hasAllClientsAccess}
          onCheckedChange={handleAllClientsChange}
        />
        <Label htmlFor="all-clients">Todos os Clientes</Label>
      </div>

      {!hasAllClientsAccess && clients && (
        <div className="space-y-2">
          <Label>Clientes específicos</Label>
          {clients.map((client) => (
            <div key={client.id} className="flex items-center space-x-2">
              <Checkbox
                id={client.id}
                checked={clientAccess.has(client.id)}
                onCheckedChange={(checked) => handleClientAccessChange(client.id, checked as boolean)}
              />
              <Label htmlFor={client.id}>{client.name}</Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
