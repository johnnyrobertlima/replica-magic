
import { useState } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { Building } from "lucide-react";
import { OniAgenciaClient, ClientFormData } from "@/types/oni-agencia";
import { ClientForm } from "@/components/oni_agencia/client/ClientForm";
import { ClientList } from "@/components/oni_agencia/client/ClientList";
import { 
  useClients, 
  useCreateClient, 
  useUpdateClient, 
  useDeleteClient 
} from "@/hooks/useOniAgenciaClients";

const OniAgenciaClientes = () => {
  const [editingClient, setEditingClient] = useState<OniAgenciaClient | null>(null);
  
  const { data: clients = [], isLoading } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const handleSubmit = async (data: ClientFormData) => {
    if (editingClient) {
      await updateMutation.mutateAsync({ id: editingClient.id, client: data });
      setEditingClient(null);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (client: OniAgenciaClient) => {
    setEditingClient(client);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    // If deleting the client that's being edited, clear the form
    if (editingClient?.id === id) {
      setEditingClient(null);
    }
    await deleteMutation.mutateAsync(id);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-2 mb-6">
          <Building className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Clientes Oni Agência</h1>
        </div>
        
        <div className="space-y-6">
          {/* Form Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </h2>
            <ClientForm 
              onSubmit={handleSubmit} 
              client={editingClient || undefined} 
              isSubmitting={isSubmitting} 
            />
          </div>

          {/* Client List Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Clientes Cadastrados</h2>
            <ClientList
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaClientes;
