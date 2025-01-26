import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientForm } from "@/components/whatsapp/client/ClientForm";
import { ClientList } from "@/components/whatsapp/client/ClientList";
import type { Database } from "@/integrations/supabase/types";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Insert"];
type ClientesWhatsRow = Database["public"]["Tables"]["Clientes_Whats"]["Row"];

export default function WhatsAppClientRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<ClientesWhatsRow | null>(null);
  
  const { data: clients, isLoading } = useQuery({
    queryKey: ["whatsapp-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Clientes_Whats")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (values: ClientesWhats) => {
    try {
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from("Clientes_Whats")
          .update(values)
          .eq("id", editingClient.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado com sucesso!",
          description: "As alterações foram salvas.",
        });

        setEditingClient(null);
      } else {
        // Create new client
        const { error } = await supabase
          .from("Clientes_Whats")
          .insert(values);

        if (error) throw error;

        toast({
          title: "Cliente cadastrado com sucesso!",
          description: "O cliente foi adicionado à lista de disparos do WhatsApp.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["whatsapp-clients"] });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: editingClient ? "Erro ao atualizar cliente" : "Erro ao cadastrar cliente",
        description: "Ocorreu um erro. Tente novamente.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("client_id", id);

      if (campaignsError) throw campaignsError;

      if (campaigns && campaigns.length > 0) {
        toast({
          variant: "destructive",
          title: "Não é possível excluir o cliente",
          description: "Existem campanhas associadas a este cliente. Por favor, exclua as campanhas primeiro.",
        });
        return;
      }

      const { error } = await supabase
        .from("Clientes_Whats")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente excluído com sucesso!",
      });

      queryClient.invalidateQueries({ queryKey: ["whatsapp-clients"] });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro ao tentar excluir o cliente. Tente novamente.",
      });
    }
  };

  const handleEdit = (client: ClientesWhatsRow) => {
    setEditingClient(client);
  };

  const handleCancel = () => {
    setEditingClient(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Cliente para Disparo de WhatsApp</h1>
      
      <ClientForm 
        onSubmit={handleSubmit}
        initialData={editingClient}
        isEditing={!!editingClient}
        onCancel={handleCancel}
      />

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Clientes Cadastrados</h2>
        <ClientList 
          clients={clients}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}