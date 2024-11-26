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
import { Loader2, Plus, Trash2, Power } from "lucide-react";

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
}

export const AdminSocial = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialMedia, isLoading } = useQuery({
    queryKey: ["social-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SocialMedia[];
    },
  });

  const createSocialMedia = useMutation({
    mutationFn: async (formData: FormData) => {
      const socialMediaData = {
        platform: String(formData.get("platform")),
        url: String(formData.get("url")),
        icon: String(formData.get("icon")),
      };

      const { error } = await supabase.from("social_media").insert([socialMediaData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      setIsCreating(false);
      toast({ title: "Rede social criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar rede social",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSocialMedia = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("social_media")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      toast({ title: "Rede social atualizada com sucesso!" });
    },
  });

  const deleteSocialMedia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      toast({ title: "Rede social excluída com sucesso!" });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    createSocialMedia.mutate(new FormData(form));
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
        <h1 className="text-2xl font-bold">Redes Sociais</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rede Social
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plataforma</label>
              <Input name="platform" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input name="url" type="url" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone</label>
              <Input name="icon" required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createSocialMedia.isPending}>
              {createSocialMedia.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Salvar
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plataforma</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {socialMedia?.map((social) => (
            <TableRow key={social.id}>
              <TableCell>{social.platform}</TableCell>
              <TableCell>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {social.url}
                </a>
              </TableCell>
              <TableCell>
                {social.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      toggleSocialMedia.mutate({
                        id: social.id,
                        is_active: social.is_active,
                      })
                    }
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteSocialMedia.mutate(social.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};