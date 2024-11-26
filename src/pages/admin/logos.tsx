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
import { Logo } from "@/types/logo";

export const AdminLogos = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logos, isLoading } = useQuery({
    queryKey: ["logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Logo[];
    },
  });

  const createLogo = useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get("logo") as File;
      let logoUrl = "";

      if (file.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`logos/${Date.now()}-${file.name}`, file);
        if (uploadError) throw uploadError;
        logoUrl = uploadData.path; // Store only the path, not the full URL
      }

      const logoData = {
        name: String(formData.get("name")),
        type: String(formData.get("type")),
        url: logoUrl,
      };

      const { error } = await supabase.from("logos").insert([logoData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logos"] });
      setIsCreating(false);
      toast({ title: "Logo criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar logo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleLogo = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("logos")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logos"] });
      toast({ title: "Logo atualizado com sucesso!" });
    },
  });

  const deleteLogo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("logos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logos"] });
      toast({ title: "Logo excluído com sucesso!" });
    },
  });

  const handleEdit = (logo: Logo) => {
    setEditingLogo(logo);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    createLogo.mutate(new FormData(form));
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
        <h1 className="text-2xl font-bold">Logos</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Logo
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
                defaultValue={editingLogo?.name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Input name="type" required />
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
                setEditingLogo(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingLogo ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Logo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logos?.map((logo) => (
            <TableRow key={logo.id}>
              <TableCell>{logo.name}</TableCell>
              <TableCell>
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="h-16 w-24 object-contain rounded"
                />
              </TableCell>
              <TableCell>{logo.type}</TableCell>
              <TableCell>
                {logo.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <ActionButtons
                  isActive={logo.is_active}
                  onToggle={() => toggleLogo.mutate({
                    id: logo.id,
                    is_active: logo.is_active,
                  })}
                  onEdit={() => handleEdit(logo)}
                  onDelete={() => deleteLogo.mutate(logo.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
