import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import { ActionButtons } from "@/components/admin/ActionButtons";

interface Client {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
}

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
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`clients/${Date.now()}-${file.name}`, file);
        if (uploadError) throw uploadError;
        logoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/oni-media/${uploadData.path}`;
      }

      const clientData = {
        name: String(formData.get("name")),
        website_url: formData.get("website_url") ? String(formData.get("website_url")) : null,
        logo_url: logoUrl,
        is_active: true, // Assume newly created clients are active by default
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

  const updateClient = useMutation({
    mutationFn: async (client: Client) => {
      const { error } = await supabase
        .from("clients")
        .update({
          name: client.name,
          website_url: client.website_url,
          logo_url: client.logo_url,
          is_active: client.is_active, // Add this line
        })
        .eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsCreating(false);
      setEditingClient(null);
      toast({ title: "Cliente atualizado com sucesso!" });
    },
  });

  const toggleClient = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("clients")
        .update({ is_active: !is_active })
        .eq("id", id);
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
    const formData = new FormData(form);

    if (editingClient) {
      // Update client
      updateClient.mutate({ 
        id: editingClient.id, 
        name: String(formData.get("name")),
        website_url: formData.get("website_url") ? String(formData.get("website_url")) : null,
        logo_url: editingClient.logo_url, // Assume logo_url doesn't change
        is_active: editingClient.is_active,
      });
    } else {
      createClient.mutate(formData);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsCreating(true);
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
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                name="name" 
                required 
                defaultValue={editingClient?.name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input 
                name="website_url" 
                type="url" 
                defaultValue={editingClient?.website_url}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo</label>
              <Input name="logo" type="file" accept="image/*" required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                editingClient ? 'Salvar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Logo</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="h-16 w-24 object-contain rounded"
                />
              </TableCell>
              <TableCell>
                {client.website_url && (
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visitar site
                  </a>
                )}
              </TableCell>
              <TableCell>
                {client.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <ActionButtons
                  isActive={client.is_active}
                  onToggle={() => toggleClient.mutate({
                    id: client.id,
                    is_active: client.is_active,
                  })}
                  onEdit={() => handleEdit(client)}
                  onDelete={() => deleteClient.mutate(client.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
