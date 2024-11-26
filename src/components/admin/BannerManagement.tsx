import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
};

const BannerManagement = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  
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

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data, error } = await supabase.storage
        .from("banners")
        .upload(`${Date.now()}-${image?.name}`, image as File);

      if (error) throw error;
      return data.path;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (banner: Omit<Banner, "id">) => {
      const { data, error } = await supabase
        .from("banners")
        .insert([banner])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner criado com sucesso!" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: Pick<Banner, "id" | "is_active">) => {
      const { error } = await supabase
        .from("banners")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner removido com sucesso!" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let image_url = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        image_url = await uploadMutation.mutateAsync(formData);
      }

      await createMutation.mutateAsync({
        title,
        description,
        image_url,
        video_url: videoUrl,
        button_text: buttonText,
        button_url: buttonUrl,
        is_active: true,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setButtonText("");
      setButtonUrl("");
      setVideoUrl("");
      setImage(null);
    } catch (error) {
      toast({
        title: "Erro ao criar banner",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Novo Banner</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Imagem</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">URL do Vídeo (YouTube)</label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Texto do Botão</label>
          <Input
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">URL do Botão</label>
          <Input
            value={buttonUrl}
            onChange={(e) => setButtonUrl(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Criar Banner"
          )}
        </Button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Banners Cadastrados</h2>
        <div className="space-y-4">
          {banners?.map((banner) => (
            <div
              key={banner.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <h3 className="font-medium">{banner.title}</h3>
                <p className="text-sm text-gray-500">{banner.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleMutation.mutate({
                    id: banner.id,
                    is_active: !banner.is_active,
                  })}
                >
                  {banner.is_active ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(banner.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;