import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { BannerForm } from "./banners/BannerForm";
import { BannerList } from "./banners/BannerList";

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
      if (error) {
        console.error("Error fetching banners:", error);
        throw error;
      }
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
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }
        const { data: { publicUrl } } = supabase.storage
          .from("oni-media")
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrl;
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
      if (error) {
        console.error("Error creating banner:", error);
        throw new Error(`Erro ao criar banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsCreating(false);
      toast({ title: "Banner criado com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in createBanner mutation:", error);
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
      if (error) {
        console.error("Error toggling banner:", error);
        throw new Error(`Erro ao atualizar banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in toggleBanner mutation:", error);
      toast({
        title: "Erro ao atualizar banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting banner:", error);
        throw new Error(`Erro ao excluir banner: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({ title: "Banner excluído com sucesso!" });
    },
    onError: (error: Error) => {
      console.error("Error in deleteBanner mutation:", error);
      toast({
        title: "Erro ao excluir banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsCreating(true);
  };

  const handleSubmit = async (formData: FormData) => {
    if (editingBanner) {
      // Handle edit
      const updatedData: any = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        button_text: String(formData.get("button_text")),
        button_link: String(formData.get("button_link")),
        youtube_url: formData.get("youtube_url") ? String(formData.get("youtube_url")) : null,
      };

      const file = formData.get("image") as File;
      if (file?.size > 0) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("oni-media")
          .upload(`banners/${Date.now()}-${file.name}`, file);
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Erro ao fazer upload da imagem",
            description: uploadError.message,
            variant: "destructive",
          });
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("oni-media")
          .getPublicUrl(uploadData.path);
        updatedData.image_url = publicUrl;
      }

      const { error } = await supabase
        .from("banners")
        .update(updatedData)
        .eq("id", editingBanner.id);

      if (error) {
        console.error("Error updating banner:", error);
        toast({
          title: "Erro ao atualizar banner",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsCreating(false);
      setEditingBanner(null);
      toast({ title: "Banner atualizado com sucesso!" });
    } else {
      // Handle create
      createBanner.mutate(formData);
    }
  };

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
        <BannerForm
          onSubmit={handleSubmit}
          editingBanner={editingBanner}
          isSubmitting={createBanner.isPending}
          onCancel={() => {
            setIsCreating(false);
            setEditingBanner(null);
          }}
        />
      )}

      <BannerList
        banners={banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onToggle={(id, is_active) => toggleBanner.mutate({ id, is_active })}
        onDelete={(id) => deleteBanner.mutate(id)}
      />
    </div>
  );
};