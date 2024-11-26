import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ActionButtons } from "@/components/admin/ActionButtons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  youtube_url: string | null;
  is_active: boolean;
}

export const AdminBanners = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Banner[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get("image") as File;
      let imageUrl = "";

      if (file.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`banners/${Date.now()}-${file.name}`, file);
        if (uploadError) throw uploadError;
        imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/oni-media/${uploadData.path}`;
      }

      const bannerData = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
        image_url: imageUrl,
      };

      const { error } = await supabase.from("banners").insert([bannerData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsCreating(false);
      toast({ title: "Banner criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleBanner = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner atualizado com sucesso!" });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner excluído com sucesso!" });
    },
  });

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (editingBanner) {
      // Handle update
      const updatedData = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
      };

      const { error } = await supabase
        .from("banners")
        .update(updatedData)
        .eq("id", editingBanner.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsCreating(false);
      setEditingBanner(null);
      toast({ title: "Banner atualizado com sucesso!" });
    } else {
      // Handle create
      createBanner.mutate(formData);
    }
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
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => {
          setEditingBanner(null);
          setIsCreating(!isCreating);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input 
                name="title" 
                required 
                defaultValue={editingBanner?.title}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Texto do Botão</label>
              <Input 
                name="button_text" 
                required 
                defaultValue={editingBanner?.button_text}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link do Botão</label>
              <Input 
                name="button_link" 
                type="url" 
                required 
                defaultValue={editingBanner?.button_link}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link do YouTube</label>
              <Input 
                name="youtube_url" 
                type="url" 
                defaultValue={editingBanner?.youtube_url || ''}
              />
            </div>
            {!editingBanner && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem</label>
                <Input name="image" type="file" accept="image/*" required />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea 
              name="description" 
              required 
              defaultValue={editingBanner?.description}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingBanner(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createBanner.isPending}>
              {createBanner.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingBanner ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Imagem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners?.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell>{banner.title}</TableCell>
              <TableCell>
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="h-16 w-24 object-cover rounded"
                />
              </TableCell>
              <TableCell>
                {banner.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <ActionButtons
                  isActive={banner.is_active}
                  onToggle={() => toggleBanner.mutate({
                    id: banner.id,
                    is_active: banner.is_active,
                  })}
                  onEdit={() => handleEdit(banner)}
                  onDelete={() => deleteBanner.mutate(banner.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
