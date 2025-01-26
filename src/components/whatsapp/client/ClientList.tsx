import { ActionButtons } from "@/components/admin/ActionButtons";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Row"];

interface ClientListProps {
  clients: ClientesWhats[] | null;
  isLoading: boolean;
  onEdit: (client: ClientesWhats) => void;
  onDelete: (id: string) => void;
}

export const ClientList = ({ clients, isLoading, onEdit, onDelete }: ClientListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {clients?.map((client) => (
        <div
          key={client.id}
          className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
        >
          <div>
            <h3 className="font-medium">{client.nome}</h3>
            <p className="text-sm text-gray-600">
              Horário: {client.horario_inicial} - {client.horario_final}
            </p>
            <div className="text-sm text-gray-600">
              {client.enviar_sabado && "Envia sábado"}
              {client.enviar_sabado && client.enviar_domingo && " • "}
              {client.enviar_domingo && "Envia domingo"}
            </div>
            {client.webhook_url && (
              <p className="text-sm text-gray-600">
                Webhook: {client.webhook_url}
              </p>
            )}
          </div>
          <ActionButtons
            onEdit={() => onEdit(client)}
            onDelete={() => onDelete(client.id)}
          />
        </div>
      ))}
    </div>
  );
};