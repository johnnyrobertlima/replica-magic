import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { ClientForm } from "@/components/admin/clients/ClientForm";
import { ClientList } from "@/components/admin/clients/ClientList";
import { Client } from "@/types/client";
import { getStorageUrl } from "@/utils/imageUtils";

export const AdminClients = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get("logo") as File;
      let logoUrl = "";

      if (file.size > 0) {
        const filePath = `clients/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        logoUrl = getStorageUrl(filePath);
      }

      const clientData = {
        name: String(formData.get("name")),
        website_url: formData.get("website_url") ? String(formData.get("website_url")) : null,
        logo_url: logoUrl,
        is_active: true,
      };

      const { error } = await supabase.from("clients").insert([clientData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsCreating(false);
      setEditingClient(null);
      toast({ title: "Cliente criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleClient = useMutation({
    mutationFn: async (client: Client) => {
      const { error } = await supabase
        .from("clients")
        .update({ is_active: !client.is_active })
        .eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente atualizado com sucesso!" });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente excluído com sucesso!" });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    createClient.mutate(new FormData(form));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {isCreating && (
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreating(false);
            setEditingClient(null);
          }}
          editingClient={editingClient}
          isLoading={createClient.isPending}
        />
      )}

      <ClientList
        clients={clients || []}
        onToggle={toggleClient.mutate}
        onEdit={(client) => {
          setEditingClient(client);
          setIsCreating(true);
        }}
        onDelete={deleteClient.mutate}
      />
    </div>
  );
};